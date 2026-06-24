"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  BookOpen,
  Package,
  Gift,
  Briefcase,
  Mail,
  LayoutDashboard,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  User,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/format";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/database.types";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  onSignOut: () => void;
}

const NAV_LINKS = [
  { href: "/courses", label: "Courses", icon: BookOpen, description: "Learn editing" },
  { href: "/templates", label: "Templates", icon: Package, description: "Premium assets" },
  { href: "/resources", label: "Free Resources", icon: Gift, description: "Grab for free" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, description: "Creator's work" },
  { href: "/contact", label: "Contact", icon: Mail, description: "Get in touch" },
];

export function MobileNav({ isOpen, onClose, user, profile, onSignOut }: MobileNavProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-bg-base/80 backdrop-blur-sm md:hidden",
          "transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[300px] max-w-[90vw] md:hidden",
          "bg-bg-elevated border-l border-bg-border",
          "flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-bg-border">
          <span className="font-display font-black text-lg text-gradient-brand">
            STIGMABOY
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary
                       hover:bg-bg-surface transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, description }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3.5 p-3.5 rounded-xl
                         hover:bg-bg-surface transition-colors duration-150 group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20
                              flex items-center justify-center shrink-0
                              group-hover:bg-brand/20 transition-colors">
                <Icon className="w-4.5 h-4.5 text-brand-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-muted">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-brand-light
                                       group-hover:translate-x-0.5 transition-all duration-150" />
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="p-4 border-t border-bg-border space-y-2">
          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-brand/20 border border-brand/30
                                flex items-center justify-center shrink-0">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <User className="w-4 h-4 text-brand-light" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {profile?.full_name ?? "User"}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user.email}</p>
                </div>
              </div>

              <MobileAuthLink
                href="/dashboard"
                icon={<LayoutDashboard className="w-4 h-4" />}
                onClick={onClose}
              >
                Dashboard
              </MobileAuthLink>

              {profile?.role === "admin" && (
                <MobileAuthLink
                  href="/admin"
                  icon={<Shield className="w-4 h-4" />}
                  onClick={onClose}
                >
                  Admin Panel
                </MobileAuthLink>
              )}

              <button
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                           text-error border border-error/20 bg-error/5
                           hover:bg-error/10 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <MobileAuthLink
                href="/login"
                icon={<LogIn className="w-4 h-4" />}
                onClick={onClose}
              >
                Sign in
              </MobileAuthLink>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3
                           rounded-xl bg-brand text-white text-sm font-semibold
                           hover:bg-brand-dark transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Get started — it&apos;s free
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function MobileAuthLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                 border border-bg-border text-text-secondary text-sm font-medium
                 hover:text-text-primary hover:border-brand/30 hover:bg-bg-surface
                 transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
