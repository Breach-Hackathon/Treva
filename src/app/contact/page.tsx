"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const party = formData.get("party");
    const dates = formData.get("dates");
    const experience = formData.get("experience");
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      await supabase.from("contact_requests").insert([{
        name,
        email,
        phone,
        party,
        dates,
        notes: experience,
      }]);
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    e.currentTarget.reset();
  };

  return (
    <main className="min-h-screen bg-background pt-28 text-text">
      {/* Header */}
      <section className="luxury-container mb-16 space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.4em] text-accent"
        >
          Begin Your Departure
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl font-serif text-3xl uppercase tracking-[0.25em] md:text-5xl"
        >
          Schedule a private consultation.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-sm leading-relaxed text-neutral-600"
        >
          Share the rough outlines — dates, people, a feeling — and your Treva
          artist will sketch a cinematic route, complete with villas, transfers,
          and experiences you did not know to ask for.
        </motion.p>
      </section>

      {/* Content */}
      <section className="luxury-container pb-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          {/* Left  — contact info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-10"
          >
            {/* Info blocks */}
            {[
              {
                label: "Email",
                value: "journeys@treva.co",
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                ),
              },
              {
                label: "Telephone",
                value: "+1 (212) 555-0199",
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                ),
              },
              {
                label: "Office",
                value: "148 Lafayette Street, New York, NY 10013",
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                ),
              },
              {
                label: "Hours",
                value: "Monday – Friday, 9am – 6pm EST",
                icon: (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ),
              },
            ].map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="mt-0.5 text-accent">{info.icon}</div>
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
                    {info.label}
                  </p>
                  <p className="mt-1 text-sm text-neutral-700">{info.value}</p>
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
                Follow Treva
              </p>
              <div className="flex gap-4 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-600">
                {["Instagram", "Pinterest", "LinkedIn"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="transition-colors hover:text-accent"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.1)] md:p-10"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1 text-xs">
                <label className="uppercase tracking-[0.26em] text-neutral-500">
                  Name
                </label>
                <input
                  required
                  name="name"
                  className="w-full border-b border-neutral-200 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-accent"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1 text-xs">
                <label className="uppercase tracking-[0.26em] text-neutral-500">
                  Email
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full border-b border-neutral-200 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-accent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1 text-xs">
                <label className="uppercase tracking-[0.26em] text-neutral-500">
                  Phone
                </label>
                <input
                  name="phone"
                  className="w-full border-b border-neutral-200 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-accent"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1 text-xs">
                <label className="uppercase tracking-[0.26em] text-neutral-500">
                  Travel party
                </label>
                <input
                  name="party"
                  className="w-full border-b border-neutral-200 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-accent"
                  placeholder="e.g. 2 adults, 1 child"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="uppercase tracking-[0.26em] text-neutral-500">
                Ideal dates &amp; destinations
              </label>
              <input
                name="dates"
                className="w-full border-b border-neutral-200 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-accent"
                placeholder="For example: late June, Amalfi + Capri"
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="uppercase tracking-[0.26em] text-neutral-500">
                How do you like to travel?
              </label>
              <textarea
                name="experience"
                className="min-h-[100px] w-full resize-none border-b border-neutral-200 bg-transparent pb-2 text-sm outline-none transition-colors focus:border-accent"
                placeholder="Tell us how you like to arrive, unwind, and explore. Any must-haves, dietary needs, or special occasions?"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-[0.65rem] uppercase tracking-[0.26em] text-neutral-400">
                Response within one business day.
              </p>
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-text px-8 py-3 text-[0.7rem] uppercase tracking-[0.25em] text-text transition-colors hover:bg-text hover:text-white"
              >
                {submitted ? "Sent ✓" : "Send request"}
              </button>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
