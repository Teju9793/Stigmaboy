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
  Home,
  Download,
  ShoppingBag,
  Heart,
  Activity,
  Settings,
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

// Public navigation links (shown to everyone)
const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home, description: "Back to homepage" },
  { href: "/courses", label: "Courses", icon: BookOpen, description: "Learn editing" },
  { href: "/templates", label: "Templates", icon: Package, description: "Premium assets" },
  { href: "/resources", label: "Free Resources", icon: Gift, description: "Grab for free" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, description: "Creator's work" },
  { href: "/contact", label: "Contact", icon: Mail, description: "Get in touch" },
];

// User account links shown only when logged in
const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/templates", label: "My Templates", icon: Package },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-bg-border shrink-0">
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* If logged in: show user info + account links */}
          {user && (
            <>
              {/* User info card */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-surface border border-bg-border">
                  <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/30
                                  flex items-center justify-center shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <User className="w-5 h-5 text-brand-light" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {profile?.full_name ?? "User"}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Account links */}
              <nav className="px-3 py-2 space-y-0.5" aria-label="Account navigation">
                <p className="px-3 py-1.5 text-2xs font-bold text-text-muted uppercase tracking-wider">
                  My Account
                </p>
                {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl
                               hover:bg-bg-surface transition-colors duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20
                                    flex items-center justify-center shrink-0
                                    group-hover:bg-brand/20 transition-colors">
                      <Icon className="w-4 h-4 text-brand-light" />
                    </div>
                    <span className="text-sm font-medium text-text-secondary
                                     group-hover:text-text-primary transition-colors">
                      {label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted ml-auto
                                             group-hover:text-brand-light
                                             group-hover:translate-x-0.5 transition-all duration-150" />
                  </Link>
                ))}

                {profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl
                               hover:bg-bg-surface transition-colors duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20
                                    flex items-center justify-center shrink-0
                                    group-hover:bg-accent/20 transition-colors">
                      <Shield className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-text-secondary
                                     group-hover:text-text-primary transition-colors">
                      Admin Panel
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />
                  </Link>
                )}
              </nav>

              {/* Divider */}
              <div className="mx-4 border-t border-bg-border my-2" />
            </>
          )}

          {/* Public nav links */}
          <nav className="px-3 py-2 space-y-0.5" aria-label="Main navigation">
            {!user && (
              <p className="px-3 py-1.5 text-2xs font-bold text-text-muted uppercase tracking-wider">
                Navigate
              </p>
            )}
            {user && (
              <p className="px-3 py-1.5 text-2xs font-bold text-text-muted uppercase tracking-wider">
                Explore
              </p>
            )}
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
                  <Icon className="w-4 h-4 text-brand-light" />
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
        </div>

        {/* Footer auth section — fixed at bottom */}
        <div className="p-4 border-t border-bg-border space-y-2 shrink-0">
          {user ? (
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
              Logout
            </button>
          ) : (
            <>
              <MobileAuthLink
                href="/login"
                icon={<LogIn className="w-4 h-4" />}
                onClick={onClose}
              >
                Login
              </MobileAuthLink>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3
                           rounded-xl bg-brand text-white text-sm font-semibold
                           hover:bg-brand-dark transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Get Started — it&apos;s free
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
