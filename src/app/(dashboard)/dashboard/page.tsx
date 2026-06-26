import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Package, Download, ShoppingBag, ArrowRight, Trophy } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

async function getDashboardData(userId: string) {
  const supabase = createClient();

  const [purchasesRes, ordersRes] = await Promise.all([
    supabase
      .from("user_purchases")
      .select("item_type")
      .eq("user_id", userId),
    supabase
      .from("orders")
      .select("id, total, status, created_at")
      .eq("user_id", userId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const purchases = purchasesRes.data ?? [];
  const courses = purchases.filter((p) => p.item_type === "course").length;
  const templates = purchases.filter((p) => p.item_type === "template").length;

  return {
    coursesCount: courses,
    templatesCount: templates,
    totalPurchases: purchases.length,
    recentOrders: ordersRes.data ?? [],
  };
}

export default async function DashboardPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const { user, profile } = data;
  const stats = await getDashboardData(user.id);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-text-muted text-sm mb-1">{greeting},</p>
        <h1 className="font-display text-3xl md:text-4xl font-black text-text-primary">
          {profile?.full_name?.split(" ")[0] ?? "Creator"} 👋
        </h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Courses"
          value={stats.coursesCount}
          href="/dashboard/courses"
          color="brand"
        />
        <StatCard
          icon={<Package className="w-5 h-5" />}
          label="Templates"
          value={stats.templatesCount}
          href="/dashboard/templates"
          color="accent"
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Orders"
          value={stats.totalPurchases}
          href="/dashboard/orders"
          color="info"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="XP Points"
          value={(profile?.xp_points ?? 0).toLocaleString("en-IN")}
          href="/dashboard/profile"
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-text-primary">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs text-brand-light hover:text-brand transition-colors
                         flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <EmptyState
              message="No orders yet"
              cta="Browse Courses"
              href="/courses"
            />
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3
                             border-b border-bg-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">
                      {formatPrice(order.total)}
                    </p>
                    <span className="text-2xs font-medium text-success bg-success/10
                                     border border-success/20 rounded-full px-2 py-0.5">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-text-primary mb-5">
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            {[
              { label: "Browse new courses", href: "/courses", icon: BookOpen },
              { label: "Download free resources", href: "/resources", icon: Download },
              { label: "Shop templates", href: "/templates", icon: Package },
              { label: "Request an edit service", href: "/contact#edit", icon: ShoppingBag },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-elevated
                           border border-bg-border hover:border-brand/30 hover:bg-brand/5
                           transition-all duration-150 group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center
                                group-hover:bg-brand/20 transition-colors">
                  <Icon className="w-4 h-4 text-brand-light" />
                </div>
                <span className="text-sm font-medium text-text-secondary
                                 group-hover:text-text-primary transition-colors">
                  {label}
                </span>
                <ArrowRight className="w-4 h-4 text-text-muted ml-auto
                                       group-hover:text-brand-light group-hover:translate-x-0.5
                                       transition-all duration-150" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href: string;
  color: "brand" | "accent" | "info" | "success";
}) {
  const colorMap = {
    brand: "bg-brand/10 text-brand-light border-brand/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
  };

  return (
    <Link
      href={href}
      className="bg-bg-surface border border-bg-border rounded-2xl p-5
                 hover:border-brand/25 hover:-translate-y-0.5
                 transition-all duration-200 block group"
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4
                       ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="font-display text-2xl font-black text-text-primary mb-1">
        {value}
      </p>
      <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
        {label}
      </p>
    </Link>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="text-center py-8">
      <p className="text-text-muted text-sm mb-4">{message}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold
                   text-brand-light hover:text-brand transition-colors"
      >
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
