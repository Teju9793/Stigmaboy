import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/BackButton";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import {
  Activity as ActivityIcon,
  ShoppingBag,
  BookOpen,
  Package,
  Trophy,
  ArrowRight,
} from "lucide-react";
import type { Order, OrderItem } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Activity — Dashboard",
  robots: { index: false },
};

async function getActivity(userId: string) {
  const supabase = createClient();

  const [ordersRes, purchasesRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("user_purchases")
      .select("item_type, purchased_at")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })
      .limit(5),
  ]);

  return {
    orders: (ordersRes.data as (Order & { items: OrderItem[] })[]) ?? [],
    purchases: purchasesRes.data ?? [],
  };
}

export default async function DashboardActivityPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const { profile } = data;
  const { orders, purchases } = await getActivity(data.user.id);

  const coursesCount = purchases.filter((p) => p.item_type === "course").length;
  const templatesCount = purchases.filter((p) => p.item_type === "template").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button */}
      <BackButton fallback="/dashboard" label="Back to Dashboard" />

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-text-primary">Activity</h1>
        <p className="text-text-muted text-sm mt-1">
          Your recent orders and account activity
        </p>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: ShoppingBag,
            label: "Total Orders",
            value: orders.length,
            color: "brand" as const,
          },
          {
            icon: BookOpen,
            label: "Courses",
            value: coursesCount,
            color: "accent" as const,
          },
          {
            icon: Package,
            label: "Templates",
            value: templatesCount,
            color: "info" as const,
          },
          {
            icon: Trophy,
            label: "XP Points",
            value: (profile?.xp_points ?? 0).toLocaleString("en-IN"),
            color: "success" as const,
          },
        ].map(({ icon: Icon, label, value, color }) => {
          const colorMap = {
            brand: "bg-brand/10 text-brand-light border-brand/20",
            accent: "bg-accent/10 text-accent border-accent/20",
            info: "bg-info/10 text-info border-info/20",
            success: "bg-success/10 text-success border-success/20",
          };
          return (
            <div
              key={label}
              className="bg-bg-surface border border-bg-border rounded-2xl p-5"
            >
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${colorMap[color]}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-display text-2xl font-black text-text-primary">{value}</p>
              <p className="text-xs text-text-muted mt-0.5 font-medium uppercase tracking-wide">
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Order History ───────────────────────────────────────── */}
      <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20
                            flex items-center justify-center">
              <ActivityIcon className="w-3.5 h-3.5 text-brand-light" />
            </div>
            <h2 className="font-display text-lg font-bold text-text-primary">
              Recent Orders
            </h2>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs text-brand-light hover:text-brand transition-colors
                       flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20
                            flex items-center justify-center mb-4">
              <ActivityIcon className="w-6 h-6 text-brand-light" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary mb-2">
              No activity yet
            </h3>
            <p className="text-text-muted text-sm max-w-xs mb-5">
              Your order history and account activity will appear here once you make your
              first purchase.
            </p>
            <Button variant="primary" size="sm" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-bg-border">
            {orders.map((order) => {
              const statusVariant: Record<
                string,
                "success" | "warning" | "error" | "default"
              > = {
                paid: "success",
                pending: "warning",
                failed: "error",
                refunded: "default",
              };

              return (
                <div key={order.id} className="px-6 py-4 hover:bg-bg-elevated transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20
                                      flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-brand-light" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatDate(order.created_at)} ·{" "}
                          {order.items?.length ?? 0}{" "}
                          {(order.items?.length ?? 0) === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={statusVariant[order.status] ?? "default"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <span className="font-display font-black text-base text-text-primary">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                  {/* Items preview */}
                  {(order.items ?? []).length > 0 && (
                    <div className="mt-2 ml-12 flex flex-wrap gap-1.5">
                      {(order.items ?? []).slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="text-xs text-text-muted bg-bg-elevated border border-bg-border
                                     rounded-lg px-2 py-0.5 truncate max-w-[160px]"
                        >
                          {item.title}
                        </span>
                      ))}
                      {(order.items ?? []).length > 3 && (
                        <span className="text-xs text-text-muted">
                          +{(order.items ?? []).length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
