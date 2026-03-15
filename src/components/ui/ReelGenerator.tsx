"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Download, Loader2, Play } from "lucide-react";
import { generateReelVideo, type ReelSlide } from "@/lib/reel-generator";

interface DestinationEntry {
  name: string;
  photoUrl: string | null;
  photoFile: File | null;
  caption: string;
  stickers: string[];
  transition: string;
}

interface ReelGeneratorProps {
  destinations: string[]; // E.g., ['Day 1: Arrival in Santorini', 'Day 2: Oia Sunset']
}

export default function ReelGenerator({ destinations: initialDestinations }: ReelGeneratorProps) {
  const [destinations, setDestinations] = useState<DestinationEntry[]>(
    initialDestinations.map(name => ({
      name,
      photoUrl: null,
      photoFile: null,
      caption: "",
      stickers: [],
      transition: "fade"
    }))
  );

  const [step, setStep] = useState<"upload" | "processing" | "ready" | "generating" | "done">("upload");
  const [progress, setProgress] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handlePhotoUpload = useCallback((index: number, file: File) => {
    const localUrl = URL.createObjectURL(file);
    setDestinations(prev => prev.map((d, i) => i === index ? { ...d, photoUrl: localUrl, photoFile: file } : d));
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const processWithAI = async () => {
    setErrorMsg("");
    setStep("processing");
    try {
      const destsWithPhotos = await Promise.all(
        destinations.map(async (d) => {
          let photoUrl = d.photoUrl;
          if (photoUrl && photoUrl.startsWith("blob:") && d.photoFile) {
            photoUrl = await fileToBase64(d.photoFile);
          }
          return { name: d.name, photoUrl };
        })
      );

      const res = await fetch("/api/generate-reel-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinations: destsWithPhotos }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI reel data");

      const aiData = data.data || [];
      setDestinations(prev => prev.map((d, i) => {
        const ai = aiData[i] || {};
        return {
          ...d,
          caption: ai.caption || "Wanderlust awaits",
          stickers: ai.stickers || ["✨ magic", "📸 snap", "🌍 explore"],
          transition: ai.transition || "fade",
        };
      }));
      setStep("ready");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "AI processing failed.");
      
      // Fallback
      setDestinations(prev => prev.map(d => ({
        ...d,
        caption: d.caption || "Beautiful moments",
        stickers: d.stickers.length ? d.stickers : ["✨ vibes", "📸 snap", "🌍 wander"],
        transition: d.transition || "fade",
      })));
      setStep("ready");
    }
  };

  const generateVideo = async () => {
    const slides: ReelSlide[] = destinations
      .filter(d => Boolean(d.photoUrl))
      .map(d => ({
        name: d.name,
        photoUrl: d.photoUrl!,
        caption: d.caption,
        stickers: d.stickers,
        transition: d.transition,
      }));

    if (slides.length === 0) {
      setErrorMsg("No photos submitted.");
      return;
    }

    setStep("generating");
    setProgress(0);

    try {
      const blob = await generateReelVideo(slides, setProgress);
      setVideoBlob(blob);
      setStep("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate video");
      setStep("ready");
    }
  };

  const downloadReel = () => {
    if (!videoBlob) return;
    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "treva-reel.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  const allUploaded = destinations.every(d => d.photoUrl);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-2xl relative">
      {/* Decorative Blur BG */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1fb4b4]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="p-8 md:p-12 relative z-10">
        <div className="mb-10 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[#1fb4b4] mb-2">Reel Studio</p>
          <h2 className="font-serif text-3xl md:text-4xl uppercase tracking-[0.1em] text-white">Capture The Magic</h2>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-center">
            {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <p className="text-sm text-neutral-400 text-center mb-6">Upload a memory for each highlight of your trip.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.map((dest, i) => (
                  <div key={i} className="rounded-2xl border border-neutral-800 bg-black/40 p-4 relative overflow-hidden group">
                    <div className="mb-3 truncate">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Stop {i + 1}</p>
                      <p className="text-sm font-medium text-white truncate" title={dest.name}>{dest.name}</p>
                    </div>

                    {dest.photoUrl ? (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden border border-neutral-700 cursor-pointer" onClick={() => fileInputRefs.current[i]?.click()}>
                        <img src={dest.photoUrl} alt={dest.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-xs text-white tracking-[0.1em] uppercase">Change</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[i]?.click()}
                        className="h-32 w-full rounded-xl border border-dashed border-neutral-700 bg-neutral-800/50 flex flex-col items-center justify-center gap-2 hover:border-[#1fb4b4] hover:bg-[#1fb4b4]/5 transition-all"
                      >
                        <Camera className="w-6 h-6 text-neutral-500" />
                        <span className="text-xs tracking-[0.1em] text-neutral-400 uppercase">Upload</span>
                      </button>
                    )}

                    <input
                      ref={el => { fileInputRefs.current[i] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(i, file);
                      }}
                      className="hidden"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-10">
                <button
                  onClick={processWithAI}
                  disabled={!destinations.some(d => d.photoUrl)}
                  className="rounded-full bg-[#1fb4b4] px-10 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1fb4b4]/90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Generate AI Magic ✨
                </button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-6"
            >
              <Loader2 className="w-12 h-12 text-[#1fb4b4] animate-spin" />
              <div className="space-y-2">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#1fb4b4]">AI Vision Analysss</p>
                <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-white">Crafting the Narrative</h3>
                <p className="text-sm text-neutral-400">Our AI is analyzing your memories to add poetic captions and aesthetic stickers...</p>
              </div>
            </motion.div>
          )}

          {step === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-white mb-2">Review Your Moments</h3>
                <p className="text-sm text-neutral-400">Ready to compile the cinematic reel.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {destinations.filter(d => Boolean(d.photoUrl)).map((dest, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-neutral-800">
                    <img src={dest.photoUrl!} alt={dest.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-[0.1em] text-neutral-500 mb-1 truncate">{dest.name}</p>
                      <p className="text-sm italic text-[#d4af37] mb-2 leading-tight">"{dest.caption}"</p>
                      <div className="flex flex-wrap gap-1">
                        {dest.stickers.map((s, si) => (
                          <span key={si} className="text-[0.65rem] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                 ))}
              </div>

              <div className="flex justify-center pt-6 pb-2">
                <button
                  onClick={generateVideo}
                  className="flex items-center gap-3 rounded-full bg-white px-10 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-black transition-all hover:bg-neutral-200"
                >
                  <Play className="w-4 h-4" /> Render Cinematic Reel
                </button>
              </div>
            </motion.div>
          )}

          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-8"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-neutral-800" />
                  <circle cx="64" cy="64" r="60" stroke="#1fb4b4" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)} className="transition-all duration-300 ease-out" />
                </svg>
                <span className="font-serif text-3xl text-white">{Math.round(progress)}<span className="text-lg text-[#1fb4b4]">%</span></span>
              </div>
              <div className="space-y-2">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#1fb4b4]">Rendering Engine</p>
                <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-white">Compiling the Masterpiece</h3>
                <p className="text-sm text-neutral-400">Applying Ken Burns effects, transitions, and finalizing details.</p>
              </div>
            </motion.div>
          )}

          {step === "done" && videoBlob && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-10 space-y-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#1fb4b4]/20 flex items-center justify-center border border-[#1fb4b4]/50">
                <svg className="w-8 h-8 text-[#1fb4b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[#d4af37]">Complete</p>
                <h3 className="font-serif text-3xl uppercase tracking-[0.1em] text-white">Your Reel awaits</h3>
              </div>

              <video 
                 src={URL.createObjectURL(videoBlob)} 
                 controls 
                 autoPlay 
                 loop 
                 muted
                 className="w-full max-w-sm rounded-[2rem] border-4 border-neutral-800 shadow-2xl bg-black"
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={downloadReel}
                  className="flex justify-center items-center gap-2 rounded-full bg-[#1fb4b4] px-8 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1fb4b4]/90"
                >
                  <Download className="w-4 h-4" /> Save to Device
                </button>
                <button
                  onClick={() => { setStep("upload"); setVideoBlob(null); setProgress(0); }}
                  className="rounded-full border border-neutral-700 bg-transparent px-8 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-300 transition-all hover:bg-neutral-800"
                >
                  Create Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
