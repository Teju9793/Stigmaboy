"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, LogOut, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/database.types";
import { MobileNav } from "./MobileNav";
import { useRouter } from "next/navigation";

interface NavbarClientProps {
  user: SupabaseUser | null;
  profile: UserProfile | null;
}

export function NavbarClient({ user, profile }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { items, openCart } = useCartStore();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const cartCount = items.length;

  return (
    <>
      <div className="flex items-center gap-2">

        {/* Cart button */}
        <button
          onClick={openCart}
          className="relative p-2.5 rounded-xl text-text-secondary
                     hover:text-text-primary hover:bg-bg-surface transition-all duration-200"
          aria-label={`Cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px]
                             bg-accent text-bg-base text-2xs font-bold rounded-full
                             flex items-center justify-center leading-none px-1">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        {/* Auth state */}
        {user ? (
          <div className="relative hidden md:block">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-bg-surface
                         transition-all duration-200 group"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/30
                              flex items-center justify-center shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name ?? "User avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-brand-light" />
                )}
              </div>
              <span className="text-sm font-medium text-text-secondary
                               group-hover:text-text-primary transition-colors hidden lg:block">
                {profile?.full_name?.split(" ")[0] ?? "Account"}
              </span>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-bg-elevated
                                border border-bg-border rounded-2xl shadow-card z-50
                                animate-fade-in overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-bg-border">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {profile?.full_name ?? "User"}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5">
                    <DropdownItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />}>
                      Dashboard
                    </DropdownItem>

                    {profile?.role === "admin" && (
                      <DropdownItem href="/admin" icon={<Shield className="w-4 h-4" />}>
                        Admin Panel
                      </DropdownItem>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm
                                 text-error rounded-xl hover:bg-error/10
                                 transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2.5 rounded-xl text-text-secondary
                     hover:text-text-primary hover:bg-bg-surface transition-all duration-200"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </>
  );
}

function DropdownItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary
                 rounded-xl hover:text-text-primary hover:bg-bg-surface
                 transition-colors duration-150"
    >
      {icon}
      {children}
    </Link>
  );
}
