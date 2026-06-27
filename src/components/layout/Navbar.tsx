"use client";

import Link from "next/link";
import { NavbarClient } from "./NavbarClient";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop blur bar */}
      <div className="absolute inset-0 bg-bg-base/85 backdrop-blur-xl border-b border-bg-border" />

      <nav className="relative section-container">
        <div className="flex items-center h-18 md:h-20 gap-4">

          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="STIGMABOY — Home"
            >
              <div className="relative">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-brand-gradient flex items-center justify-center
                                shadow-brand-glow group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-display font-black text-sm md:text-base">S</span>
                </div>
              </div>
              <span className="font-display font-black text-xl md:text-2xl tracking-tight text-text-primary
                               group-hover:text-gradient-brand transition-all duration-200">
                STIGMABOY
              </span>
            </Link>
          </div>

          {/* Desktop Navigation — centred and balanced */}
          <nav
            className="hidden md:flex items-center justify-center gap-1 xl:gap-2"
            aria-label="Main navigation"
          >
            <NavLink href="/">Home</NavLink>
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/templates">Templates</NavLink>
            <NavLink href="/resources">Free Resources</NavLink>
            <NavLink href="/portfolio">Portfolio</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Right: Auth + Cart */}
          <div className="flex-1 flex justify-end">
            <NavbarClient />
          </div>

        </div>
      </nav>
    </header>
  );
}

// Desktop nav link
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative px-4 py-2 text-sm md:text-base font-semibold text-text-secondary
                 rounded-lg transition-all duration-200
                 hover:text-text-primary hover:bg-bg-surface
                 group whitespace-nowrap"
    >
      {children}
      {/* Active indicator — animated underline */}
      <span className="absolute bottom-1 left-4 right-4 h-px bg-brand scale-x-0
                       group-hover:scale-x-100 transition-transform duration-200 origin-left" />
    </Link>
  );
}
