"use client";

import { useState, useEffect } from "react";
import { User, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/index";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

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
        <div className="h-64 bg-bg-elevated rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-black text-text-primary">
          Profile
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Manage your account information
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5 p-6 bg-bg-surface border border-bg-border rounded-2xl">
        <div className="relative">
          <div className="w-18 h-18 rounded-2xl bg-brand/20 border border-brand/30
                          flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-brand-light" />
            )}
          </div>
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {profile?.full_name ?? "User"}
          </p>
          <p className="text-xs text-text-muted">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge bg-brand/10 text-brand-light border-brand/20 text-2xs capitalize">
              {profile?.role ?? "user"}
            </span>
            <span className="badge bg-accent/10 text-accent border-accent/20 text-2xs">
              {(profile?.xp_points ?? 0).toLocaleString("en-IN")} XP
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
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
