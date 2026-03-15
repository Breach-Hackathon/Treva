"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReelGenerator from "@/components/ui/ReelGenerator";
import { Camera, MapPin, Plus, X } from "lucide-react";

export default function ReelsPage() {
  const [destinations, setDestinations] = useState<string[]>([]);
  const [newDest, setNewDest] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  const addDestination = () => {
    const name = newDest.trim();
    if (!name) return;
    if (destinations.includes(name)) return;
    setDestinations((prev) => [...prev, name]);
    setNewDest("");
  };

  const removeDestination = (idx: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <main className="min-h-screen bg-surface pt-32 pb-24 text-text">
      <div className="luxury-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 space-y-4 text-center"
        >
          <p className="text-xs uppercase tracking-[0.45em] text-[#1fb4b4]">
            Treva Studios
          </p>
          <h1 className="font-serif text-3xl uppercase tracking-[0.25em] md:text-5xl">
            Cinematic Reel Generator
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-neutral-600">
            Immortalize your journey. Upload photos from your destinations and let our AI 
            craft a beautifully transitioned, poetic video reel.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-12 text-center"
            >
              <div className="mb-8">
                <Camera className="w-10 h-10 mx-auto text-[#1fb4b4] mb-4" />
                <h2 className="font-serif text-2xl uppercase tracking-[0.1em] text-black">Where did you go?</h2>
                <p className="text-sm text-neutral-500 mt-2">Add at least two stops from your trip to begin the reel creation.</p>
              </div>

              <div className="flex gap-2 mb-8">
                <input
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDestination()}
                  placeholder="e.g. Kyoto, Lake Como, Santorini..."
                  className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm outline-none transition-all focus:border-[#1fb4b4] focus:bg-white"
                />
                <button
                  onClick={addDestination}
                  className="rounded-2xl bg-black px-6 text-white transition-all hover:bg-neutral-800"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-10 text-left">
                {destinations.map((dest, i) => (
                  <motion.div
                    key={dest}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-between items-center rounded-xl border border-neutral-100 bg-neutral-50 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#1fb4b4]" />
                      <span className="font-medium text-black">{dest}</span>
                    </div>
                    <button
                      onClick={() => removeDestination(i)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {destinations.length === 0 && (
                  <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-400">
                    No destinations added yet
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsStarted(true)}
                disabled={destinations.length < 2}
                className="w-full rounded-full bg-[#1fb4b4] py-4 text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1fb4b4]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Reel
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 flex justify-center">
                <button
                   onClick={() => setIsStarted(false)}
                   className="text-[0.65rem] uppercase tracking-[0.2em] text-neutral-500 hover:text-black transition-colors"
                >
                  ← Edit Destinations
                </button>
              </div>
              <ReelGenerator destinations={destinations} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
