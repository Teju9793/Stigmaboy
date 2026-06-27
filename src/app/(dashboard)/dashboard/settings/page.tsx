import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/lib/supabase/server";
import { BackButton } from "@/components/ui/BackButton";
import {
  Bell, Lock, Trash2, Shield, Eye, Mail,
  Smartphone, Globe, Moon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Settings — Dashboard",
  robots: { index: false },
};

export default async function DashboardSettingsPage() {
  const data = await getUserWithProfile();
  if (!data?.user) redirect("/login");

  const { user, profile } = data;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Back button */}
      <BackButton fallback="/dashboard" label="Back to Dashboard" />

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-text-primary">Settings</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage your account preferences and privacy
        </p>
      </div>

      {/* ── Account Info ────────────────────────────────────────── */}
      <SettingsSection title="Account" icon={<Shield className="w-4 h-4" />}>
        <SettingsRow
          icon={<Mail className="w-4 h-4" />}
          label="Email address"
          description={user.email ?? "—"}
          badge="Verified"
          badgeColor="success"
        />
        <SettingsRow
          icon={<Globe className="w-4 h-4" />}
          label="Username"
          description={profile?.username ? `@${profile.username}` : "Not set — update in Profile"}
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          label="Account role"
          description={profile?.role ?? "user"}
          badge={profile?.role === "admin" ? "Admin" : "Member"}
          badgeColor={profile?.role === "admin" ? "accent" : "brand"}
        />
      </SettingsSection>

      {/* ── Notifications ───────────────────────────────────────── */}
      <SettingsSection title="Notifications" icon={<Bell className="w-4 h-4" />}>
        <ToggleRow
          icon={<Mail className="w-4 h-4" />}
          label="Email notifications"
          description="Receive updates about orders, new courses, and offers"
          defaultOn
        />
        <ToggleRow
          icon={<Smartphone className="w-4 h-4" />}
          label="Push notifications"
          description="Browser push alerts for important updates"
          defaultOn={false}
        />
        <ToggleRow
          icon={<Bell className="w-4 h-4" />}
          label="Promotional emails"
          description="Discounts, flash sales, and new template drops"
          defaultOn
        />
      </SettingsSection>

      {/* ── Appearance ──────────────────────────────────────────── */}
      <SettingsSection title="Appearance" icon={<Moon className="w-4 h-4" />}>
        <SettingsRow
          icon={<Moon className="w-4 h-4" />}
          label="Theme"
          description="Dark mode is active — light mode coming soon"
          badge="Dark"
          badgeColor="brand"
        />
      </SettingsSection>

      {/* ── Privacy ─────────────────────────────────────────────── */}
      <SettingsSection title="Privacy" icon={<Eye className="w-4 h-4" />}>
        <ToggleRow
          icon={<Eye className="w-4 h-4" />}
          label="Public profile"
          description="Allow others to see your username and bio"
          defaultOn
        />
        <ToggleRow
          icon={<Globe className="w-4 h-4" />}
          label="Show social links"
          description="Display your Instagram and YouTube on your profile"
          defaultOn
        />
      </SettingsSection>

      {/* ── Security ────────────────────────────────────────────── */}
      <SettingsSection title="Security" icon={<Lock className="w-4 h-4" />}>
        <SettingsRow
          icon={<Lock className="w-4 h-4" />}
          label="Password"
          description={
            user.app_metadata?.provider === "google"
              ? "Signed in with Google — no password required"
              : "Change your account password"
          }
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          label="Sign-in method"
          description={
            user.app_metadata?.provider === "google"
              ? "Google OAuth"
              : "Email & Password"
          }
          badge={user.app_metadata?.provider === "google" ? "Google" : "Email"}
          badgeColor="brand"
        />
      </SettingsSection>

      {/* ── Danger Zone ─────────────────────────────────────────── */}
      <div className="bg-error/5 border border-error/20 rounded-2xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-error/10 border border-error/20
                          flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-error" />
          </div>
          <h2 className="font-display text-lg font-bold text-error">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-text-primary">Delete Account</p>
              <p className="text-xs text-text-muted mt-0.5 max-w-xs">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              disabled
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                         border border-error/40 text-error/60 cursor-not-allowed
                         opacity-60"
              title="Contact support to delete your account"
            >
              Delete Account
            </button>
          </div>
          <p className="text-xs text-text-muted">
            To delete your account, please contact us at{" "}
            <a href="mailto:support@stigmaboy.com" className="text-brand-light hover:underline">
              support@stigmaboy.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function SettingsSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-bg-border">
        <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20
                        flex items-center justify-center text-brand-light">
          {icon}
        </div>
        <h2 className="font-display text-base font-bold text-text-primary">{title}</h2>
      </div>
      <div className="divide-y divide-bg-border">{children}</div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: "success" | "brand" | "accent" | "error";
}) {
  const badgeColorMap = {
    success: "bg-success/10 text-success border-success/20",
    brand: "bg-brand/10 text-brand-light border-brand/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    error: "bg-error/10 text-error border-error/20",
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-text-muted">{icon}</span>
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      {badge && badgeColor && (
        <span className={`badge border text-xs ${badgeColorMap[badgeColor]}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  defaultOn,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  defaultOn: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-text-muted">{icon}</span>
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      {/* Visual-only toggle — not wired to backend */}
      <div
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0
                    ${defaultOn ? "bg-brand" : "bg-bg-border"}`}
        aria-label={`${label} — ${defaultOn ? "on" : "off"} (UI only)`}
        title="Notification settings — coming soon"
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm
                      transition-transform duration-200
                      ${defaultOn ? "translate-x-5" : "translate-x-1"}`}
        />
      </div>
    </div>
  );
}
