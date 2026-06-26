import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                        rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
        />
      </div>

      {/* Logo header */}
      <header className="relative z-10 px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group"
          aria-label="STIGMABOY — Back to home"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center
                          shadow-brand-glow group-hover:scale-110 transition-transform duration-200">
            <span className="text-white font-display font-black text-sm">S</span>
          </div>
          <span className="font-display font-black text-xl text-text-primary">
            STIGMABOY
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer note */}
      <footer className="relative z-10 text-center py-6 text-xs text-text-muted">
        <p>
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-text-secondary hover:text-brand-light transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-text-secondary hover:text-brand-light transition-colors">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
