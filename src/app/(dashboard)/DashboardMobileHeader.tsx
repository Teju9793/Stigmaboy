"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils/format";
import type { UserProfile } from "@/types/database.types";

interface Props {
  profile: UserProfile | null;
  links: Array<{ href: string; label: string; icon: React.ElementType }>;
}

export function DashboardMobileHeader({ profile, links }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-bg-surface/90 backdrop-blur-xl
                         border-b border-bg-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="text-white font-display font-black text-xs">S</span>
          </div>
          <span className="font-display font-black text-base text-text-primary">Dashboard</span>
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary
                     hover:bg-bg-elevated transition-colors"
          aria-label="Toggle dashboard menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative ml-auto w-72 bg-bg-elevated h-full flex flex-col
                          border-l border-bg-border animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand/20 border border-brand/30
                                flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-brand-light" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {profile?.full_name ?? "User"}
                  </p>
                  <p className="text-xs text-brand-light font-medium">
                    {(profile?.xp_points ?? 0).toLocaleString("en-IN")} XP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary
                           hover:bg-bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                      "transition-all duration-150",
                      isActive
                        ? "bg-brand/15 text-brand-light border border-brand/25"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-bg-border">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm
                           text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to store
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
