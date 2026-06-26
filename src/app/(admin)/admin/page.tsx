import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";
import { Users, BookOpen, Package, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — STIGMABOY",
  robots: { index: false, follow: false },
};

async function getAdminStats() {
  const supabase = createClient();

  const [usersRes, coursesRes, templatesRes, revenueRes] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("templates").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("orders").select("total").eq("status", "paid"),
  ]);

  const revenue = (revenueRes.data ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    users: usersRes.count ?? 0,
    courses: coursesRes.count ?? 0,
    templates: templatesRes.count ?? 0,
    revenue,
  };
}

export default async function AdminPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-text-muted text-sm mb-1">Admin Panel</p>
        <h1 className="font-display text-3xl font-black text-text-primary">Overview</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.users.toLocaleString("en-IN"), icon: Users, color: "text-brand-light bg-brand/10 border-brand/20" },
          { label: "Live Courses", value: stats.courses, icon: BookOpen, color: "text-accent bg-accent/10 border-accent/20" },
          { label: "Templates", value: stats.templates, icon: Package, color: "text-info bg-info/10 border-info/20" },
          { label: "Total Revenue", value: formatPrice(stats.revenue), icon: TrendingUp, color: "text-success bg-success/10 border-success/20" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-bg-surface border border-bg-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-display text-2xl font-black text-text-primary mb-1">{value}</p>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-bg-surface border border-bg-border rounded-2xl p-8 text-center">
        <p className="text-text-muted text-sm">
          📊 Full analytics charts coming in Phase 5. Revenue data is live above.
        </p>
      </div>
    </div>
  );
}
