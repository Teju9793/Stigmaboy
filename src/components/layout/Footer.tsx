import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { label: "Courses", href: "/courses" },
    { label: "Templates", href: "/templates" },
    { label: "Free Resources", href: "/resources" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
  ],
  Account: [
    { label: "Sign in", href: "/login" },
    { label: "Create Account", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Purchases", href: "/dashboard/orders" },
    { label: "Downloads", href: "/dashboard/downloads" },
  ],
  Support: [
    { label: "Contact", href: "/contact" },
    { label: "Request Edit Service", href: "/contact#edit" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refunds" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_CREATOR_INSTAGRAM ?? "https://instagram.com/stigmaboy",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_CREATOR_YOUTUBE ?? "https://youtube.com/@stigmaboy",
    icon: Youtube,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-bg-border bg-bg-surface mt-auto">
      {/* Main footer */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center
                              shadow-brand-glow group-hover:scale-110 transition-transform">
                <span className="text-white font-display font-black text-sm">S</span>
              </div>
              <span className="font-display font-black text-xl text-text-primary">
                STIGMABOY
              </span>
            </Link>

            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              Premium editing resources for creators who refuse to be average.
              Courses, templates, and edit services — built different.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow on ${label}`}
                  className="w-9 h-9 rounded-xl bg-bg-elevated border border-bg-border
                             flex items-center justify-center text-text-muted
                             hover:text-text-primary hover:border-brand/40 hover:bg-brand/10
                             transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* India tag */}
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-xs">
                🇮🇳 Made in India — Payments secured by
              </span>
              <span className="text-xs font-semibold text-text-secondary">Razorpay</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="space-y-4">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-text-secondary hover:text-text-primary
                                 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-bg-border">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs text-text-muted">
          <p>© {year} STIGMABOY. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for creators
            <span className="text-brand-light">✦</span>
            by a creator
          </p>
        </div>
      </div>
    </footer>
  );
}
