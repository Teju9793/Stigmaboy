import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/lib/supabase/server";
import {
  LayoutDashboard, Users, BookOpen, Package,
  Gift, ShoppingBag, Scissors, Tag, Megaphone,
  BarChart2, Settings, Shield, ArrowLeft,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/templates", label: "Templates", icon: Package },
  { href: "/admin/resources", label: "Resources", icon: Gift },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/edit-requests", label: "Edit Requests", icon: Scissors },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getUserWithProfile();

  if (!data?.user) {
    redirect("/login?redirect=/admin");
  }

  // Role check — server-side, after RLS
  if (data.profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Admin sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-bg-border
                        bg-bg-surface sticky top-0 h-screen overflow-y-auto">
        {/* Brand + admin badge */}
        <div className="px-4 py-5 border-b border-bg-border">
          <Link href="/" className="flex items-center gap-2 group mb-3">
            <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center
                            group-hover:scale-110 transition-transform">
              <span className="text-white font-display font-black text-xs">S</span>
            </div>
            <span className="font-display font-black text-base text-text-primary">STIGMABOY</span>
          </Link>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-brand/10
                          border border-brand/25">
            <Shield className="w-3.5 h-3.5 text-brand-light" />
            <span className="text-xs font-bold text-brand-light">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5" aria-label="Admin navigation">
          {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                         text-text-secondary hover:text-text-primary hover:bg-bg-elevated
                         transition-all duration-150"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-2.5 border-t border-bg-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                       text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
