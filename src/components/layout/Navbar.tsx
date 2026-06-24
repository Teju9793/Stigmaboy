import Link from "next/link";
import Image from "next/image";
import { getUserWithProfile } from "@/lib/supabase/server";
import { NavbarClient } from "./NavbarClient";

// Server component — reads auth state server-side
export async function Navbar() {
  const data = await getUserWithProfile();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Backdrop blur bar */}
      <div className="absolute inset-0 bg-bg-base/85 backdrop-blur-xl border-b border-bg-border" />

      <nav className="relative section-container">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="STIGMABOY — Home"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center
                              shadow-brand-glow group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-display font-black text-sm">S</span>
              </div>
            </div>
            <span className="font-display font-black text-xl tracking-tight text-text-primary
                             group-hover:text-gradient-brand transition-all duration-200">
              STIGMABOY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/templates">Templates</NavLink>
            <NavLink href="/resources">Free Resources</NavLink>
            <NavLink href="/portfolio">Portfolio</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          {/* Right: Auth + Cart */}
          <NavbarClient user={data?.user ?? null} profile={data?.profile ?? null} />
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
      className="relative px-3.5 py-2 text-sm font-medium text-text-secondary
                 rounded-lg transition-all duration-200
                 hover:text-text-primary hover:bg-bg-surface
                 group"
    >
      {children}
      {/* Active indicator — animated underline */}
      <span className="absolute bottom-1 left-3.5 right-3.5 h-px bg-brand scale-x-0
                       group-hover:scale-x-100 transition-transform duration-200 origin-left" />
    </Link>
  );
}
