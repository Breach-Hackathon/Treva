import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-[#0c0c0c] text-white">
      <div className="luxury-container py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <p className="font-serif text-sm uppercase tracking-[0.3em]">
              Treva
            </p>
            <p className="text-[0.75rem] leading-relaxed text-neutral-500">
              Ultra-luxury travel concierge. Cinematic journeys designed around
              you — from runway to retreat.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
              Explore
            </p>
            <ul className="space-y-2">
              {[
                { href: "/travel", label: "Destinations" },
                { href: "/journal", label: "Journal" },
                { href: "/gallery", label: "Gallery" },
                { href: "/ai-planner", label: "AI Trip Planner" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.75rem] text-neutral-500 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
              Get in Touch
            </p>
            <ul className="space-y-2 text-[0.75rem] text-neutral-500">
              <li>journeys@treva.in</li>
              <li>+91 79 3061 6000</li>
              <li>Nirma University, Sarkhej-Gandhinagar Highway, Ahmedabad</li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
              Connect
            </p>
            <ul className="space-y-2">
              {["Instagram", "Pinterest", "LinkedIn", "Twitter"].map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="text-[0.75rem] text-neutral-500 transition-colors hover:text-white"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-[0.65rem] tracking-[0.15em] text-neutral-600">
              © 2026 Treva — The Travel Company. All rights reserved.
            </p>
            <div className="flex gap-6 text-[0.65rem] tracking-[0.15em] text-neutral-600">
              <a href="#" className="hover:text-neutral-400">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-neutral-400">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Big text */}
          <p className="mt-12 text-center font-serif text-[clamp(3rem,10vw,8rem)] uppercase leading-none tracking-[0.1em] text-white/[0.04]">
            Treva
          </p>
        </div>
      </div>
    </footer>
  );
}
