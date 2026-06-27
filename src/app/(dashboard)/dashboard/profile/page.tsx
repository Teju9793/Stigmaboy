"use client";

import { useState, useEffect } from "react";
import {
  User, Save, CheckCircle2, BookOpen, Package, Heart,
  Download, ShoppingBag, Settings, ArrowRight, Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/index";
import { BackButton } from "@/components/ui/BackButton";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

// ─────────────────────────────────────────────────────────────
// Stats type
// ─────────────────────────────────────────────────────────────
interface ProfileStats {
  coursesCount: number;
  templatesCount: number;
  wishlistCount: number;
  downloadsCount: number;
}

export default function DashboardProfilePage() {
  const { user, profile, loading, refresh } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    instagram_url: "",
    youtube_url: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<ProfileStats>({
    coursesCount: 0,
    templatesCount: 0,
    wishlistCount: 0,
    downloadsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        username: profile.username ?? "",
        bio: profile.bio ?? "",
        instagram_url: profile.instagram_url ?? "",
        youtube_url: profile.youtube_url ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  // Fetch stats
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      const [purchasesRes, wishlistRes] = await Promise.all([
        supabase.from("user_purchases").select("item_type").eq("user_id", user.id),
        supabase.from("wishlist_items").select("id").eq("user_id", user.id),
      ]);

      const purchases = purchasesRes.data ?? [];
      setStats({
        coursesCount: purchases.filter((p) => p.item_type === "course").length,
        templatesCount: purchases.filter((p) => p.item_type === "template").length,
        wishlistCount: (wishlistRes.data ?? []).length,
        downloadsCount: purchases.filter((p) => p.item_type === "template").length,
      });
      setStatsLoading(false);
    };

    void fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name: form.full_name || null,
        username: form.username || null,
        bio: form.bio || null,
        instagram_url: form.instagram_url || null,
        youtube_url: form.youtube_url || null,
        phone: form.phone || null,
      })
      .eq("id", user.id);

    setSaving(false);
    if (updateError) {
      if (updateError.message.includes("username")) {
        setError("That username is already taken.");
      } else {
        setError("Failed to save. Please try again.");
      }
    } else {
      setSaved(true);
      await refresh();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-bg-elevated rounded w-48" />
        <div className="h-40 bg-bg-elevated rounded-2xl" />
        <div className="h-64 bg-bg-elevated rounded-2xl" />
      </div>
    );
  }

  const QUICK_ACTIONS = [
    { label: "My Courses", href: "/dashboard/courses", icon: BookOpen, count: stats.coursesCount },
    { label: "My Templates", href: "/dashboard/templates", icon: Package, count: stats.templatesCount },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag, count: null },
    { label: "Downloads", href: "/dashboard/downloads", icon: Download, count: stats.downloadsCount },
    { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart, count: stats.wishlistCount },
    { label: "Settings", href: "/dashboard/settings", icon: Settings, count: null },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Back button */}
      <BackButton fallback="/dashboard" label="Back to Dashboard" />

      {/* ── Profile Header ─────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-3xl font-black text-text-primary">Profile</h1>
        <p className="text-text-muted text-sm mt-1">Your account overview and personal information</p>
      </div>

      {/* Profile card */}
      <div className="bg-bg-surface border border-bg-border rounded-2xl p-6">
        <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-brand/20 border border-brand/30
                          flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-9 h-9 text-brand-light" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl font-black text-text-primary">
              {profile?.full_name ?? "User"}
            </h2>
            <p className="text-sm text-text-muted mt-0.5">{user?.email}</p>
            {profile?.username && (
              <p className="text-xs text-brand-light mt-0.5">@{profile.username}</p>
            )}
            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span className="badge bg-brand/10 text-brand-light border border-brand/20 text-2xs capitalize">
                {profile?.role ?? "user"}
              </span>
              <span className="badge bg-accent/10 text-accent border border-accent/20 text-2xs">
                {(profile?.xp_points ?? 0).toLocaleString("en-IN")} XP
              </span>
              {profile?.created_at && (
                <span className="flex items-center gap-1 text-2xs text-text-muted">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDate(profile.created_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Courses", value: statsLoading ? "—" : stats.coursesCount, icon: BookOpen, color: "brand" as const },
          { label: "Templates", value: statsLoading ? "—" : stats.templatesCount, icon: Package, color: "accent" as const },
          { label: "Wishlist", value: statsLoading ? "—" : stats.wishlistCount, icon: Heart, color: "error" as const },
          { label: "Downloads", value: statsLoading ? "—" : stats.downloadsCount, icon: Download, color: "success" as const },
        ].map(({ label, value, icon: Icon, color }) => {
          const colorMap = {
            brand: "bg-brand/10 text-brand-light border-brand/20",
            accent: "bg-accent/10 text-accent border-accent/20",
            error: "bg-error/10 text-error border-error/20",
            success: "bg-success/10 text-success border-success/20",
          };
          return (
            <div
              key={label}
              className="bg-bg-surface border border-bg-border rounded-2xl p-4 text-center"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mx-auto mb-2 ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-display text-2xl font-black text-text-primary">{value}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <div className="bg-bg-surface border border-bg-border rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, count }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-elevated border border-bg-border
                         hover:border-brand/30 hover:bg-brand/5 transition-all duration-150 group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0
                              group-hover:bg-brand/20 transition-colors">
                <Icon className="w-4 h-4 text-brand-light" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-secondary
                                 group-hover:text-text-primary transition-colors block">
                  {label}
                </span>
                {count !== null && (
                  <span className="text-xs text-text-muted">{count} item{count !== 1 ? "s" : ""}</span>
                )}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted ml-auto shrink-0
                                     group-hover:text-brand-light group-hover:translate-x-0.5
                                     transition-all duration-150" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Edit Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-5 bg-bg-surface border border-bg-border rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-text-primary mb-2">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            placeholder="Your name"
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
            placeholder="yourhandle"
            hint="Used in your public profile URL"
          />
        </div>

        <Textarea
          label="Bio"
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          placeholder="Tell us about yourself..."
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Instagram URL"
            type="url"
            value={form.instagram_url}
            onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))}
            placeholder="https://instagram.com/..."
          />
          <Input
            label="YouTube URL"
            type="url"
            value={form.youtube_url}
            onChange={(e) => setForm((p) => ({ ...p, youtube_url: e.target.value }))}
            placeholder="https://youtube.com/..."
          />
        </div>

        <Input
          label="Phone (optional)"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="+91 00000 00000"
        />

        {error && (
          <p className="text-sm text-error">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            leftIcon={saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            className={saved ? "bg-success hover:bg-success" : ""}
          >
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
