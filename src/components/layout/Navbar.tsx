"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const baseLinks = [
  { href: "/travel", label: "Travel" },
  { href: "/journal", label: "Journal" },
  { href: "/gallery", label: "Gallery" },
  { href: "/ai-planner", label: "AI Planner" },
  { href: "/reels", label: "Reel Studio" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/auth");
  const [accountLabel, setAccountLabel] = useState("Account");
  const [ctaLabel, setCtaLabel] = useState("Sign in");
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Detect auth state and adapt the account / CTA buttons so that
  // an already-signed-in user is taken to the dashboard instead of
  // bouncing back to the auth page.
  useEffect(() => {
    let mounted = true;

    const detectUser = async () => {
      try {
        if (!("auth" in supabase)) return;

        const {
          data: { user },
        } = await (supabase as any).auth.getUser();

        if (!mounted) return;

        if (user) {
          setAccountHref("/dashboard");
          setAccountLabel("Dashboard");
          setCtaLabel("Account");
        } else {
          setAccountHref("/auth");
          setAccountLabel("Account");
          setCtaLabel("Sign in");
        }
      } catch {
        // If Supabase is not configured or fails, fall back to default behaviour.
        if (!mounted) return;
        setAccountHref("/auth");
        setAccountLabel("Account");
        setCtaLabel("Sign in");
      }
    };

    detectUser();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center">
      <nav
        className={`mt-6 flex w-[min(1240px,96vw)] items-center justify-between rounded-full border px-6 py-3 text-sm uppercase tracking-[0.25em] transition-all duration-500 ${
          scrolled || !isHome
            ? "border-white/40 bg-white/70 text-text shadow-[0_18px_50px_rgba(15,23,42,0.15)] backdrop-blur-xl"
            : "border-white/10 bg-white/10 text-white backdrop-blur-0"
        }`}
      >
        <Link
          href="/"
          className="font-serif text-xs md:text-sm whitespace-nowrap"
        >
          Treva
          <span className="ml-2 font-sans tracking-[0.3em] opacity-60">
            The Travel Company
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex whitespace-nowrap">
          {[
            ...baseLinks,
            {
              href: accountHref,
              label: accountLabel,
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[0.7rem] tracking-[0.3em] whitespace-nowrap transition-colors hover:opacity-80 ${
                pathname === link.href ? "text-accent" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`h-0.5 w-5 rounded-full bg-current transition-transform ${
              menuOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-current transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 rounded-full bg-current transition-transform ${
              menuOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </button>

        {/* Desktop CTA */}
        <Link
          href={accountHref}
          className="hidden rounded-full border border-current px-4 py-2 text-[0.65rem] tracking-[0.3em] transition-colors hover:bg-text hover:text-white md:inline-flex"
        >
          {ctaLabel}
        </Link>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute left-1/2 top-20 w-[min(400px,90vw)] -translate-x-1/2 rounded-2xl border border-white/30 bg-white/90 p-6 shadow-xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {[
              ...baseLinks,
              {
                href: accountHref,
                label: accountLabel,
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.75rem] uppercase tracking-[0.25em] text-text transition-colors hover:text-accent ${
                  pathname === link.href ? "text-accent" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={accountHref}
              className="mt-2 rounded-full border border-text px-6 py-2.5 text-center text-[0.65rem] uppercase tracking-[0.25em] text-text transition-colors hover:bg-text hover:text-white"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
