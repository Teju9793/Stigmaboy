import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Download,
  ShoppingBag,
  Heart,
  User,
  ArrowLeft,
} from "lucide-react";
import { DashboardMobileHeader } from "./DashboardMobileHeader";

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/dashboard/templates", label: "Templates", icon: Package },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/orders", label: "Order History", icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getUserWithProfile();

  if (!data?.user) {
    redirect("/login?redirect=/dashboard");
  }

  const { user, profile } = data;

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Mobile header */}
      <DashboardMobileHeader profile={profile} links={SIDEBAR_LINKS} />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-bg-border
                          bg-bg-surface sticky top-0 h-screen">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-bg-border">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-display font-black text-xs">S</span>
              </div>
              <span className="font-display font-black text-base text-text-primary">
                STIGMABOY
              </span>
            </Link>
          </div>

          {/* User info */}
          <div className="px-5 py-4 border-b border-bg-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/20 border border-brand/30
                              flex items-center justify-center shrink-0 overflow-hidden">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
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
            {/* XP bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs text-text-muted font-medium">XP Points</span>
                <span className="text-2xs font-bold text-brand-light">
                  {(profile?.xp_points ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-1 bg-bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((profile?.xp_points ?? 0) % 500) / 5, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Dashboard navigation">
            {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => (
              <SidebarLink key={href} href={href} label={label} icon={<Icon className="w-4 h-4" />} />
            ))}
          </nav>

          {/* Back to site */}
          <div className="p-3 border-t border-bg-border">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                         text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated
                         transition-colors duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to store
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Server-compatible sidebar link — active state handled via CSS
function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                 text-text-secondary transition-all duration-150
                 hover:text-text-primary hover:bg-bg-elevated
                 aria-[current=page]:bg-brand/10 aria-[current=page]:text-brand-light
                 aria-[current=page]:border aria-[current=page]:border-brand/20"
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </Link>
  );
}
