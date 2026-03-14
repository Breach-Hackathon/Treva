 "use client";

 import { useState, useRef, useEffect } from "react";
 import { useRouter } from "next/navigation";
 import { motion, AnimatePresence } from "framer-motion";
 import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stayAt: string;
}

interface TripSuggestion {
  mood: string;
  tripName: string;
  tagline: string;
  destination: string;
  country: string;
  duration: string;
  bestSeason: string;
  estimatedBudget: string;
  heroDescription: string;
  itinerary: ItineraryDay[];
  highlights: string[];
  packingEssentials: string[];
  travelTips: string[];
  cuisineToTry: string[];
  images: string[];
}

/* ------------------------------------------------------------------ */
/*  Prompt inspiration chips                                           */
/* ------------------------------------------------------------------ */
const INSPIRATIONS = [
  "A romantic getaway in the Greek islands",
  "Solo adventure through Japanese countryside",
  "Family-friendly safari in Kenya",
  "Honeymoon in the Maldives with overwater villas",
  "Winter escape to Swiss Alps with skiing",
  "Cultural immersion in Marrakech, Morocco",
  "Beach and ruins trip in Tulum, Mexico",
  "Northern lights expedition in Iceland",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const PENDING_WISHLIST_KEY = "treva_pending_wishlist";
const LOCAL_WISHLIST_KEY = "treva_local_wishlist_items";
const ACTIVE_WISHLIST_TRIP_KEY = "treva_active_wishlist_trip";

export default function AiTripPlanner() {
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<TripSuggestion[] | null>(null);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const trip = options ? options[activeOptionIndex] : null;

  const promptHasBudget = (text: string) => {
    const lowered = text.toLowerCase();
    const currencyRegex = /₹|\$|eur|usd|inr|rs\.?/i;
    const budgetWordsRegex = /(budget|under|less than|up to|maximum|max)\s+\d/;
    return currencyRegex.test(text) || budgetWordsRegex.test(lowered);
  };

  /**
   * Try to extract a requested trip length in days from free text,
   * e.g. "6 days", "6-day", "6 night", "6 nights".
   */
  const extractDurationDays = (text: string): number | null => {
    if (!text) return null;
    const match = text.toLowerCase().match(/(\d+)\s*-(day|days|night|nights)|(\d+)\s*(day|days|night|nights)/);
    if (!match) return null;
    const num = parseInt(match[1] || match[3], 10);
    if (!Number.isFinite(num)) return null;
    return num;
  };

  /**
   * Extract a rough numeric budget from a free-text phrase.
   * e.g. "under 30000", "₹50,000", "budget 1,20,000" → 30000 / 50000 / 120000
   */
  const extractBudgetAmount = (text: string): number | null => {
    if (!text) return null;
    const match = text.replace(/,/g, "").match(/(\d{3,})/);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    return Number.isFinite(value) ? value : null;
  };

  /**
   * Ensure the prompt contains a HARD upper‑bound instruction for the budget.
   * If we can parse a number (e.g. 30000), we append a very explicit constraint
   * so the AI keeps the total trip cost ≤ that number.
   */
  const enforceHardBudgetConstraint = (basePrompt: string, explicitBudget?: string) => {
    const fromExplicit = explicitBudget ? extractBudgetAmount(explicitBudget) : null;
    const fromPrompt = extractBudgetAmount(basePrompt);
    const budgetMax = fromExplicit ?? fromPrompt;

    if (!budgetMax) return basePrompt.trim();

    const constraint = ` The TOTAL budget for the entire trip (all travelers combined) must be at most ₹${budgetMax}. Do not exceed this amount in any case; if necessary, shorten the trip or choose simpler stays so that the estimatedBudget is always ≤ ₹${budgetMax}.`;

    return `${basePrompt.trim()}${constraint}`;
  };

  /**
   * Ensure the prompt includes a clear instruction to keep the
   * number of days / nights consistent with what the user asked for.
   */
  const enforceDurationConstraint = (basePrompt: string) => {
    const days = extractDurationDays(basePrompt);
    if (!days) return basePrompt.trim();

    const durationText = ` The itinerary must cover approximately ${days} day(s) of travel (with a matching number of nights) as requested. Do not silently reduce the trip length to fewer days; if the budget is too low for ${days} days, explain that clearly but still structure a ${days}-day plan.`;

    return `${basePrompt.trim()}${durationText}`;
  };

  // If user arrived from the dashboard by clicking "Revisit" on a saved itinerary,
  // hydrate the planner with that exact trip so they can continue from where they left off.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACTIVE_WISHLIST_TRIP_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        prompt?: string;
        trip?: TripSuggestion;
      };
      if (data.trip) {
        setPrompt(data.prompt ?? "");
        setOptions([data.trip]);
        setActiveOptionIndex(0);
        setActiveDay(0);
        setActiveImageIndex(0);
        // Clear the handoff so it doesn't reapply on refresh.
        window.localStorage.removeItem(ACTIVE_WISHLIST_TRIP_KEY);
        // Scroll down to the result after a short delay.
        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 300);
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  const callGenerateApi = async (text: string) => {
    setLoading(true);
    setError("");
    setOptions(null);
    setActiveOptionIndex(0);

    try {
      const finalPrompt = enforceHardBudgetConstraint(
        enforceDurationConstraint(text)
      );

      const res = await fetch("/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${finalPrompt.trim()} Assume this trip is planned for two travelers unless I explicitly mentioned a different group size.`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setOptions(data.options);
      setActiveDay(0);
      setActiveImageIndex(0);

      // Scroll to results after a short delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const saveTripLocally = () => {
    if (!trip) return;
    try {
      const existingRaw = window.localStorage.getItem(LOCAL_WISHLIST_KEY);
      const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
      const entry = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        title: trip.tripName,
        destination: trip.destination,
        estimated_budget: trip.estimatedBudget,
        prompt,
        trip_data: trip,
        isLocal: true,
      };
      const next = [entry, ...existing];
      window.localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(next));
    } catch {
      // swallow localStorage errors
    }
  };

  const generate = async (customPrompt?: string) => {
    const text = customPrompt ?? prompt;
    if (!text.trim()) return;

    if (!promptHasBudget(text)) {
      setPendingPrompt(text);
      setBudgetInput("");
      setShowBudgetModal(true);
      return;
    }

    await callGenerateApi(text);
  };

  const handleConfirmBudget = async () => {
    if (!pendingPrompt || !budgetInput.trim()) return;
    const base = `${pendingPrompt.trim()} My budget for this trip is ${budgetInput.trim()}.`;
    const combinedPrompt = enforceHardBudgetConstraint(
      enforceDurationConstraint(base),
      budgetInput
    );
    setShowBudgetModal(false);
    setPendingPrompt(null);
    await callGenerateApi(combinedPrompt);
  };

  const handleSaveToWishlist = async () => {
    if (!options || !trip) return;
    setSaveMessage(null);
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        try {
          const payload = {
            prompt,
            activeOptionIndex,
            trip,
            createdAt: new Date().toISOString(),
          };
          window.localStorage.setItem(
            PENDING_WISHLIST_KEY,
            JSON.stringify(payload)
          );
        } catch {
          // ignore storage failures
        }
        window.location.href = "/auth?redirect=/dashboard";
        return;
      }

      const { error } = await supabase.from("wishlist_trips").insert({
        user_id: user.id,
        title: trip.tripName,
        destination: trip.destination,
        estimated_budget: trip.estimatedBudget,
        prompt,
        trip_data: trip,
      });

      if (error) {
        console.error(error);
        saveTripLocally();
        setSaveMessage(
          "Could not save to the cloud. Saved locally in this browser instead."
        );
      } else {
        setSaveMessage("Saved to your wishlist.");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      saveTripLocally();
      setSaveMessage(
        "Something went wrong while saving online. Saved locally in this browser instead."
      );
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  // Slideshow effect for active trip images
  useEffect(() => {
    if (!trip || !trip.images || trip.images.length === 0) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % trip.images.length);
    }, 4000); // 4 seconds per image
    return () => clearInterval(interval);
  }, [trip]);

  return (
    <section
      id="ai-planner"
      className="relative overflow-hidden bg-surface py-24 text-text md:py-32"
    >
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1fb4b4]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-[#D4AF37]/8 blur-[100px]" />

      <div className="luxury-container relative z-10">
        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 space-y-4 text-center"
        >
          <p className="text-xs uppercase tracking-[0.45em] text-[#1fb4b4]">
            Powered by AI
          </p>
          <h2 className="font-serif text-3xl uppercase tracking-[0.25em] md:text-5xl">
            Dream it. We&apos;ll design&nbsp;it.
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-neutral-600">
            Describe your perfect trip in a single sentence and our AI Travel
            Architect will craft a bespoke itinerary in seconds.
          </p>
        </motion.div>

        {/* ── INPUT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl"
        >
          <div className="group relative rounded-2xl border border-neutral-200 bg-white p-1 backdrop-blur-md transition-all duration-500 focus-within:border-[#1fb4b4]/40 focus-within:shadow-[0_0_40px_rgba(31,180,180,0.12)]">
            <div className="flex items-center gap-2">
              {/* Sparkle icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1fb4b4]/10 text-[#1fb4b4]">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>

              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="A romantic week in Santorini with wine tasting…"
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent py-4 text-sm text-text outline-none placeholder:text-neutral-400"
              />

              <button
                onClick={() => generate()}
                disabled={loading || !prompt.trim()}
                className="mr-1 flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#1fb4b4] px-5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1fb4b4]/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Crafting…
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>

          {/* Inspiration chips */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {INSPIRATIONS.slice(0, 4).map((insp) => (
              <button
                key={insp}
                onClick={() => {
                  setPrompt(insp);
                  generate(insp);
                }}
                disabled={loading}
                className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-neutral-500 transition-all hover:border-[#1fb4b4]/30 hover:text-[#1fb4b4] disabled:opacity-40"
              >
                {insp}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── ERROR ── */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── LOADING SKELETON ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto mt-16 max-w-4xl"
            >
              <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1fb4b4]/30 border-t-[#1fb4b4]" />
                  <p className="text-xs uppercase tracking-[0.3em] text-[#1fb4b4]">
                    Your AI Travel Architect is designing your journey…
                  </p>
                </div>
                {/* Skeleton blocks */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div
                      className="h-4 animate-pulse rounded bg-neutral-200"
                      style={{ width: `${70 - i * 12}%` }}
                    />
                    <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-100" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULT ── */}
        <AnimatePresence>
          {trip && options && !loading && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mx-auto mt-16 max-w-5xl"
            >
              <div className="mb-10 flex flex-wrap justify-center gap-4">
                {options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveOptionIndex(idx);
                      setActiveDay(0);
                    }}
                    className={`rounded-full border px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] transition-all shadow-sm ${activeOptionIndex === idx
                      ? "border-[#1fb4b4] bg-[#1fb4b4]/10 text-[#1fb4b4]"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 hover:bg-neutral-50"
                      }`}
                  >
                    Mood: {opt.mood}
                  </button>
                ))}
              </div>

              {/* Hero card */}
              <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-black/40 p-8 shadow-sm md:p-12 min-h-[500px] flex items-end">
                {/* Image Slideshow Background */}
                <div className="absolute inset-0 z-0 bg-neutral-900">
                  <AnimatePresence mode="popLayout">
                    {trip.images && trip.images.length > 0 ? (
                      <motion.img
                        key={trip.images[activeImageIndex] || trip.images[0]}
                        src={trip.images[activeImageIndex] || trip.images[0]}
                        alt={`${trip.tripName} highlights`}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1600`;
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 flex items-center justify-center">
                        <p className="text-white/40 text-sm uppercase tracking-wider">Loading images...</p>
                      </div>
                    )}
                  </AnimatePresence>
                  {/* Subtle vignette/gradient over images */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                <div className="relative z-10 w-full space-y-6 pt-32">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/70">
                        AI-Crafted Itinerary
                      </p>
                      <h3 className="font-serif text-3xl uppercase tracking-[0.2em] text-white md:text-5xl drop-shadow-md">
                        {trip.tripName}
                      </h3>
                      <p className="text-sm italic text-white/80 drop-shadow-sm max-w-xl">
                        &ldquo;{trip.tagline}&rdquo;
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 self-end">
                      {[
                        trip.destination,
                        trip.duration,
                        trip.bestSeason,
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="max-w-3xl text-sm leading-relaxed text-white/90 drop-shadow-sm">
                    {trip.heroDescription}
                  </p>

                  <div className="inline-block rounded-full border border-[#d4af37]/40 bg-black/40 backdrop-blur-md px-5 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-[#d4af37]">
                    Est. {trip.estimatedBudget}
                  </div>
                </div>
              </div>

              {/* Day-by-day itinerary */}
              <div className="mt-8 space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Day-by-day itinerary
                </p>

                {/* Day selector pills */}
                <div className="flex flex-wrap gap-2">
                  {trip.itinerary.map((day, i) => (
                    <button
                      key={day.day}
                      onClick={() => setActiveDay(i)}
                      className={`rounded-full border px-4 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition-all ${activeDay === i
                        ? "border-[#1fb4b4] bg-[#1fb4b4]/15 text-[#1fb4b4]"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                        }`}
                    >
                      Day {day.day}
                    </button>
                  ))}
                </div>

                {/* Active day details */}
                <AnimatePresence mode="wait">
                  {trip.itinerary[activeDay] && (
                    <motion.div
                      key={activeDay}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
                    >
                      <h4 className="mb-6 font-serif text-xl uppercase tracking-[0.15em]">
                        {trip.itinerary[activeDay]!.title}
                      </h4>

                      <div className="grid gap-6 md:grid-cols-3">
                        {(
                          [
                            {
                              label: "Morning",
                              text: trip.itinerary[activeDay]!.morning,
                              icon: "☀️",
                            },
                            {
                              label: "Afternoon",
                              text: trip.itinerary[activeDay]!.afternoon,
                              icon: "🌤️",
                            },
                            {
                              label: "Evening",
                              text: trip.itinerary[activeDay]!.evening,
                              icon: "🌙",
                            },
                          ] as const
                        ).map((slot) => (
                          <div key={slot.label} className="space-y-2">
                            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-500">
                              {slot.icon} {slot.label}
                            </p>
                            <p className="text-sm leading-relaxed text-neutral-700">
                              {slot.text}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center gap-2 border-t border-neutral-100 pt-4">
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-[#D4AF37]"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                          />
                        </svg>
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#D4AF37]">
                          Stay at: {trip.itinerary[activeDay]!.stayAt}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom grid: highlights + packing + tips + food */}
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Highlights */}
                <InfoCard
                  title="Highlights"
                  icon="✦"
                  items={trip.highlights}
                  accentColor="#1fb4b4"
                />
                {/* Packing */}
                <InfoCard
                  title="Pack"
                  icon="🧳"
                  items={trip.packingEssentials}
                  accentColor="#D4AF37"
                />
                {/* Tips */}
                <InfoCard
                  title="Tips"
                  icon="💡"
                  items={trip.travelTips}
                  accentColor="#1fb4b4"
                />
                {/* Cuisine */}
                <InfoCard
                  title="Must Try"
                  icon="🍽️"
                  items={trip.cuisineToTry}
                  accentColor="#D4AF37"
                />
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex flex-col items-center gap-3 text-center"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-500">
                  Love this itinerary?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveToWishlist}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1fb4b4] px-8 py-3 text-[0.7rem] uppercase tracking-[0.25em] text-white transition-colors hover:bg-[#1fb4b4]/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save to wishlist"}
                  </button>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-full border border-[#1fb4b4] bg-[#1fb4b4]/10 px-8 py-3 text-[0.7rem] uppercase tracking-[0.25em] text-[#1fb4b4] transition-all hover:bg-[#1fb4b4] hover:text-white"
                  >
                    Book this trip with Treva →
                  </a>
                </div>
                {saveMessage && (
                  <p className="text-[0.7rem] uppercase tracking-[0.2em] text-neutral-500">
                    {saveMessage}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* ── BUDGET MODAL ── */}
        <AnimatePresence>
          {showBudgetModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
              >
                <h3 className="mb-2 font-serif text-lg uppercase tracking-[0.2em] text-neutral-900">
                  Add your budget
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                  To craft a precise itinerary, please share your approximate budget for this trip (per person or total).
                </p>
                <input
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="e.g. ₹2,00,000 per person"
                  className="mb-4 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#1fb4b4]"
                  autoFocus
                />
                <div className="flex justify-end gap-3 text-[0.7rem] uppercase tracking-[0.2em]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBudgetModal(false);
                      setPendingPrompt(null);
                    }}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-neutral-500 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!budgetInput.trim() || loading}
                    onClick={handleConfirmBudget}
                    className="rounded-full bg-[#1fb4b4] px-5 py-2 text-white hover:bg-[#1fb4b4]/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Info card                                           */
/* ------------------------------------------------------------------ */
function InfoCard({
  title,
  icon,
  items,
  accentColor,
}: {
  title: string;
  icon: string;
  items: string[];
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <p
        className="mb-3 text-[0.65rem] uppercase tracking-[0.3em]"
        style={{ color: accentColor }}
      >
        {icon} {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-neutral-600"
          >
            <span
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
