 "use client";

 export default function SmoothScroll({
   children,
 }: {
   children: React.ReactNode;
 }) {
   // Lenis-based smooth scrolling was causing scroll issues across the site.
   // Use native browser scrolling for consistent behaviour.
   return <>{children}</>;
 }

