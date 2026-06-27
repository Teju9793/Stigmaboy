import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUserWithProfile } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { Badge } from "@/components/ui/index";
import type { Order, OrderItem } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Order History — Dashboard",
  robots: { index: false },
};

async function getOrders(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data as (Order & { items: OrderItem[] })[]) ?? [];
}

export default async function DashboardOrdersPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const orders = await getOrders(data.user.id);

  return (
    <div className="space-y-8 animate-fade-in">
      <BackButton fallback="/dashboard" label="Back to Dashboard" />
      <div>
        <h1 className="font-display text-3xl font-black text-text-primary">
          Order History
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center
                        border border-dashed border-bg-border rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20
                          flex items-center justify-center mb-5">
            <ShoppingBag className="w-7 h-7 text-brand-light" />
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary mb-2">
            No orders yet
          </h2>
          <p className="text-text-muted text-sm max-w-xs mb-6">
            Browse courses and templates to make your first purchase.
          </p>
          <Button variant="primary" asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order & { items: OrderItem[] } }) {
  const statusVariant: Record<string, "success" | "warning" | "error" | "default"> = {
    paid: "success",
    pending: "warning",
    failed: "error",
    refunded: "default",
  };

  return (
    <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
        <div>
          <p className="text-sm font-bold text-text-primary">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[order.status] ?? "default"}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <span className="font-display font-black text-lg text-text-primary">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-bg-border">
        {(order.items ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="badge bg-bg-elevated border border-bg-border text-text-muted text-2xs capitalize">
                {item.item_type}
              </span>
              <p className="text-sm text-text-secondary">{item.title}</p>
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {formatPrice(item.price)}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      {order.discount_amount > 0 && (
        <div className="px-6 py-3 border-t border-bg-border flex justify-between">
          <p className="text-xs text-text-muted">Discount applied</p>
          <p className="text-xs text-success font-semibold">
            -{formatPrice(order.discount_amount)}
          </p>
        </div>
      )}
    </div>
  );
}
