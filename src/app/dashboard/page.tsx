 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { travelData } from "@/data/travelData";

 interface WishlistTrip {
   id: string;
   created_at: string;
   title: string;
   destination: string | null;
   estimated_budget: string | null;
   prompt: string | null;
  trip_data: any;
  isLocal?: boolean;
 }

const PENDING_WISHLIST_KEY = "treva_pending_wishlist";
const LOCAL_WISHLIST_KEY = "treva_local_wishlist_items";
const ACTIVE_WISHLIST_TRIP_KEY = "treva_active_wishlist_trip";

export default function DashboardPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [wishlist, setWishlist] = useState<WishlistTrip[]>([]);
   const [error, setError] = useState<string | null>(null);
   const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeWishlistTrip, setActiveWishlistTrip] =
    useState<WishlistTrip | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

   useEffect(() => {
     let mounted = true;

    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth?redirect=/dashboard");
          return;
        }

        try {
          const raw = window.localStorage.getItem(PENDING_WISHLIST_KEY);
          if (raw) {
            const pending = JSON.parse(raw) as {
              prompt: string;
              activeOptionIndex: number;
              trip: any;
            };
            await supabase.from("wishlist_trips").insert({
              user_id: user.id,
              title: pending.trip?.tripName ?? "Saved itinerary",
              destination: pending.trip?.destination ?? null,
              estimated_budget: pending.trip?.estimatedBudget ?? null,
              prompt: pending.prompt ?? null,
              trip_data: pending.trip ?? null,
            });
            window.localStorage.removeItem(PENDING_WISHLIST_KEY);
          }
        } catch {
          // ignore storage / insert failures for pending wishlist
        }

        const wishlistItems: WishlistTrip[] = [];

        // Load from Supabase (cloud) if available
        try {
          const { data, error } = await supabase
            .from("wishlist_trips")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) {
            console.error(error);
          } else if (data) {
            wishlistItems.push(...(data as WishlistTrip[]));
          }
        } catch (err) {
          console.error(err);
        }

        // Merge with any locally stored wishlist entries (fallback)
        try {
          const localRaw = window.localStorage.getItem(LOCAL_WISHLIST_KEY);
          if (localRaw) {
            const localParsed = (JSON.parse(localRaw) as WishlistTrip[]).map(
              (item) => ({
                ...item,
                isLocal: true,
              })
            );
            wishlistItems.push(...localParsed);
          }
        } catch {
          // ignore local load errors
        }

        if (mounted) {
          if (wishlistItems.length === 0) {
            setWishlist([]);
          } else {
            // De-duplicate by id in case the same trip exists in both sources
            const seen = new Set<string>();
            const unique = wishlistItems.filter((item) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            });
            setWishlist(unique);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

     load();

     const interval = setInterval(() => {
       setActiveHeroIndex((prev) => (prev + 1) % travelData.length);
     }, 5000);

     return () => {
       mounted = false;
       clearInterval(interval);
     };
   }, [router]);

   const activeHero = travelData[activeHeroIndex];

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await (supabase as any).auth.signOut();
      if (error) {
        console.error(error);
      }
      router.push("/auth");
    } catch (err) {
      console.error(err);
    } finally {
      setSigningOut(false);
    }
  };

  const handleDeleteWishlistItem = async (item: WishlistTrip) => {
    setDeletingId(item.id);
    try {
      if (item.isLocal) {
        // Remove from local storage
        try {
          const raw = window.localStorage.getItem(LOCAL_WISHLIST_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as WishlistTrip[];
            const next = parsed.filter((entry) => entry.id !== item.id);
            window.localStorage.setItem(
              LOCAL_WISHLIST_KEY,
              JSON.stringify(next)
            );
          }
        } catch {
          // ignore local storage errors
        }
      } else {
        // Delete from Supabase
        try {
          const { error } = await supabase
            .from("wishlist_trips")
            .delete()
            .eq("id", item.id);
          if (error) {
            console.error(error);
          }
        } catch (err) {
          console.error(err);
        }
      }

      // Update local state
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
      if (activeWishlistTrip && activeWishlistTrip.id === item.id) {
        setActiveWishlistTrip(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleRevisitInPlanner = (item: WishlistTrip) => {
    try {
      const payload = {
        prompt: item.prompt ?? "",
        trip: item.trip_data,
      };
      window.localStorage.setItem(
        ACTIVE_WISHLIST_TRIP_KEY,
        JSON.stringify(payload)
      );
    } catch {
      // ignore storage errors; user will just see a fresh planner
    }
    router.push("/ai-planner#ai-planner");
  };

   return (
     <main className="min-h-screen bg-background pt-28 text-text">
       <section className="luxury-container mb-16 space-y-6">
         <div className="flex items-start justify-between gap-4">
           <div>
             <motion.p
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-xs uppercase tracking-[0.4em] text-accent"
             >
               Your Treva dashboard
             </motion.p>
             <motion.h1
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="max-w-3xl font-serif text-3xl uppercase tracking-[0.25em] md:text-5xl"
             >
               Welcome back to your journeys.
             </motion.h1>
           </div>
           <button
             type="button"
             onClick={handleSignOut}
             disabled={signingOut}
             className="rounded-full border border-neutral-300 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-neutral-700 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
           >
             {signingOut ? "Signing out…" : "Sign out"}
           </button>
         </div>
         <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="max-w-xl text-sm leading-relaxed text-neutral-600"
         >
           Explore a rotating gallery of Treva&apos;s signature trips, and
           revisit every itinerary you&apos;ve saved with the AI Planner.
         </motion.p>
       </section>

       {/* Featured slideshow from travel page data */}
       <section className="luxury-container mb-16">
         <div className="grid gap-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-center">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeHero.id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.6 }}
               className="overflow-hidden rounded-3xl bg-black shadow-[0_20px_60px_rgba(15,23,42,0.35)]"
             >
               <Link href={`/travel/${activeHero.id}`} className="block">
                 <div className="relative aspect-[16/9]">
                   <img
                     src={activeHero.image}
                     alt={activeHero.title}
                     className="h-full w-full object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                   <div className="absolute bottom-6 left-6 right-6 space-y-2">
                     <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/80">
                       {activeHero.meta} · {activeHero.country}
                     </p>
                     <h2 className="font-serif text-2xl uppercase tracking-[0.2em] text-white md:text-3xl">
                       {activeHero.title}
                     </h2>
                     <p className="max-w-xl text-xs leading-relaxed text-white/80">
                       {activeHero.copy}
                     </p>
                     <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-white">
                       View trip details
                     </span>
                   </div>
                 </div>
               </Link>
             </motion.div>
           </AnimatePresence>

           <div className="space-y-4">
             <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
               Signature journeys
             </p>
             <p className="text-sm leading-relaxed text-neutral-600">
               A rotating preview of Treva&apos;s predesigned trips. Use these as
               inspiration, or hand the wheel to the AI Planner for something
               written entirely around you.
             </p>
             <div className="flex flex-wrap gap-2">
               {travelData.map((trip, idx) => (
                 <button
                   key={trip.id}
                   onClick={() => setActiveHeroIndex(idx)}
                   className={`rounded-full border px-4 py-1.5 text-[0.6rem] uppercase tracking-[0.2em] transition-all ${
                     idx === activeHeroIndex
                       ? "border-accent bg-accent/10 text-accent"
                       : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
                   }`}
                 >
                   {trip.country}
                 </button>
               ))}
             </div>
           </div>
         </div>
       </section>

       {/* Wishlist section */}
       <section className="luxury-container pb-24">
         <div className="mb-6 flex items-center justify-between gap-4">
           <div>
             <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
               Wishlist
             </p>
             <h2 className="mt-1 font-serif text-xl uppercase tracking-[0.2em]">
               Saved AI itineraries
             </h2>
           </div>
           <button
             type="button"
             onClick={() => router.push("/ai-planner")}
             className="rounded-full border border-neutral-300 px-5 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-neutral-700 transition-colors hover:border-accent hover:text-accent"
           >
             Open AI planner
           </button>
         </div>

         {loading && (
           <p className="text-sm text-neutral-500">Loading your wishlist…</p>
         )}

         {error && (
           <p className="text-sm text-red-500">
             {error}
           </p>
         )}

         {!loading && !error && wishlist.length === 0 && (
           <p className="text-sm text-neutral-500">
             You haven&apos;t saved any itineraries yet. Generate a trip with the
             AI Planner and tap &quot;Save to wishlist&quot; to see it here.
           </p>
         )}

         <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
           {wishlist.map((item) => (
             <div
               key={item.id}
               className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-sm shadow-sm"
             >
               <button
                 type="button"
                 onClick={() => setActiveWishlistTrip(item)}
                 className="text-left"
               >
                 <p className="text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400">
                   {new Date(item.created_at).toLocaleDateString()}
                 </p>
                 <h3 className="mt-2 font-serif text-lg uppercase tracking-[0.15em]">
                   {item.title}
                 </h3>
                 <p className="mt-1 text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                   {item.destination ?? "Custom destination"}
                 </p>
                 {item.estimated_budget && (
                   <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-accent">
                     Est. {item.estimated_budget}
                   </p>
                 )}
                 {item.isLocal && (
                   <p className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-neutral-400">
                     Saved locally in this browser
                   </p>
                 )}
                 {item.prompt && (
                   <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-600">
                     “{item.prompt}”
                   </p>
                 )}
               </button>
               <button
                 type="button"
                 onClick={() => handleDeleteWishlistItem(item)}
                 disabled={deletingId === item.id}
                 className="self-end text-[0.65rem] uppercase tracking-[0.2em] text-red-500 hover:text-red-600 disabled:opacity-50"
               >
                 {deletingId === item.id ? "Deleting…" : "Delete itinerary"}
               </button>
             </div>
           ))}
         </div>
       </section>

       {/* Active wishlist trip modal */}
       <AnimatePresence>
         {activeWishlistTrip && activeWishlistTrip.trip_data && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
           >
             <motion.div
               initial={{ y: 40, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 40, opacity: 0 }}
               className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
             >
               <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 md:flex-row md:items-start md:justify-between">
                 <div>
                   <p className="text-[0.6rem] uppercase tracking-[0.3em] text-neutral-400">
                     Saved itinerary
                     {activeWishlistTrip.isLocal ? " · Local only" : ""}
                   </p>
                   <h3 className="mt-2 font-serif text-2xl uppercase tracking-[0.18em]">
                     {activeWishlistTrip.title}
                   </h3>
                   {activeWishlistTrip.estimated_budget && (
                     <p className="mt-1 text-[0.7rem] uppercase tracking-[0.25em] text-accent">
                       Est. {activeWishlistTrip.estimated_budget}
                     </p>
                   )}
                 </div>
                 <div className="flex flex-wrap items-center gap-3">
                   <Link
                     href={
                       activeWishlistTrip
                         ? `/contact?from=wishlist&trip=${encodeURIComponent(
                             activeWishlistTrip.title
                           )}`
                         : "/contact"
                     }
                     className="rounded-lg border border-accent px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent hover:text-white"
                   >
                     Contact us about this trip
                   </Link>
                   <button
                     type="button"
                     onClick={() => handleRevisitInPlanner(activeWishlistTrip)}
                     className="rounded-lg border border-neutral-300 px-3 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-600 hover:bg-neutral-100"
                   >
                     Open in AI Planner
                   </button>
                   <button
                     type="button"
                     onClick={() => setActiveWishlistTrip(null)}
                     className="rounded-lg border border-neutral-300 px-3 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-600 hover:bg-neutral-100"
                   >
                     Close
                   </button>
                 </div>
               </div>

               {activeWishlistTrip.trip_data && (
                 <div className="mt-4 space-y-4 text-sm text-neutral-700">
                   <p>
                     <span className="font-semibold">Destination:</span>{" "}
                     {activeWishlistTrip.trip_data.destination}
                   </p>
                   <p>
                     <span className="font-semibold">Duration:</span>{" "}
                     {activeWishlistTrip.trip_data.duration}
                   </p>
                   {Array.isArray(activeWishlistTrip.trip_data.itinerary) && (
                     <div className="mt-4 space-y-3">
                       <p className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                         Day-by-day plan
                       </p>
                       <div className="space-y-3">
                         {activeWishlistTrip.trip_data.itinerary.map(
                           (day: any) => (
                             <div
                               key={day.day}
                               className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                             >
                               <p className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                                 Day {day.day}: {day.title}
                               </p>
                               <p className="mt-1 text-xs">
                                 <span className="font-semibold">Morning:</span>{" "}
                                 {day.morning}
                               </p>
                               <p className="mt-1 text-xs">
                                 <span className="font-semibold">Afternoon:</span>{" "}
                                 {day.afternoon}
                               </p>
                               <p className="mt-1 text-xs">
                                 <span className="font-semibold">Evening:</span>{" "}
                                 {day.evening}
                               </p>
                             </div>
                           )
                         )}
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
     </main>
   );
 }

