"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/index";
import { cn } from "@/lib/utils/format";

type FormErrors = Partial<Record<keyof RegisterInput, string>>;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterInput>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError("");
  };

  // Password strength indicator
  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-error", "bg-warning", "bg-info", "bg-success"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          setServerError("This email is already registered. Try signing in instead.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setServerError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
        },
      });
      if (error) setServerError(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="bg-bg-surface border border-success/30 rounded-2xl p-10 shadow-card">
          <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-2xl font-black text-text-primary mb-3">
            Check your email
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            We sent a verification link to{" "}
            <strong className="text-text-primary">{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Button variant="secondary" size="md" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-black text-text-primary mb-2">
          Create your account
        </h1>
        <p className="text-text-secondary text-sm">
          Free to join — start learning immediately
        </p>
      </div>

      {/* Card */}
      <div className="bg-bg-surface border border-bg-border rounded-2xl p-8 shadow-card">

        {/* Google OAuth */}
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleGoogleLogin}
          loading={googleLoading}
          leftIcon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          }
        >
          Sign up with Google
        </Button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-bg-border" />
          <span className="text-xs text-text-muted font-medium">or</span>
          <div className="flex-1 h-px bg-bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} noValidate className="space-y-4">
          <Input
            label="Full name"
            type="text"
            name="full_name"
            id="full_name"
            autoComplete="name"
            placeholder="Your name"
            value={form.full_name}
            onChange={handleChange}
            error={errors.full_name}
            leftElement={<User className="w-4 h-4" />}
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            leftElement={<Mail className="w-4 h-4" />}
          />

          {/* Password with strength meter */}
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                className={cn(
                  "input-base pl-10 pr-10",
                  errors.password && "border-error focus:border-error focus:ring-error/30"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted
                           hover:text-text-secondary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        passwordStrength >= level
                          ? strengthColors[passwordStrength]
                          : "bg-bg-border"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  Strength:{" "}
                  <span className={cn(
                    "font-medium",
                    passwordStrength <= 1 && "text-error",
                    passwordStrength === 2 && "text-warning",
                    passwordStrength === 3 && "text-info",
                    passwordStrength === 4 && "text-success",
                  )}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </p>
              </div>
            )}

            {errors.password && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <span aria-hidden="true">✕</span> {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="label">Confirm password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirm_password}
                onChange={handleChange}
                className={cn(
                  "input-base pl-10",
                  errors.confirm_password && "border-error focus:border-error focus:ring-error/30"
                )}
              />
            </div>
            {errors.confirm_password && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <span aria-hidden="true">✕</span> {errors.confirm_password}
              </p>
            )}
          </div>

          {serverError && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/25 text-error text-sm flex items-start gap-2">
              <span aria-hidden="true" className="shrink-0 mt-0.5">⚠</span>
              <span>{serverError}</span>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2">
            Create account
          </Button>
        </form>
      </div>

      <p className="text-center mt-6 text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-light font-semibold hover:text-brand transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
