import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Play, Star, Users, BookOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "STIGMABOY — Premium Editing Courses & Templates",
  description:
    "Learn cinematic editing, color grading, and motion graphics from India's boldest creator. Premium courses, Premiere Pro & After Effects templates.",
};

// Revalidate every 30 minutes — stats update
export const revalidate = 1800;

// ============================================================
// STATS — fetched server-side
// ============================================================

async function getStats() {
  try {
    const supabase = createClient();

    const [coursesRes, templatesRes, studentsRes] = await Promise.all([
      supabase
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("templates")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true }),
    ]);

    return {
      courses: coursesRes.count ?? 0,
      templates: templatesRes.count ?? 0,
      students: studentsRes.count ?? 0,
    };
  } catch {
    return { courses: 0, templates: 0, students: 0 };
  }
}

// ============================================================
// HOME PAGE
// ============================================================

export default async function HomePage() {
  const stats = await getStats();

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "STIGMABOY",
            url: process.env.NEXT_PUBLIC_APP_URL,
            description:
              "Premium editing courses, templates, and creative resources for video creators.",
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "INR",
              offerCount: stats.courses + stats.templates,
            },
          }),
        }}
      />

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background — grid + radial glow */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-hero-grid" />
        {/* Ambient violet blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: "radial-gradient(circle, #F59E0B, transparent)" }}
          aria-hidden="true"
        />

        <div className="relative section-container py-24 md:py-0">
          <div className="max-w-4xl">

            {/* Eyebrow label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                            border border-brand/30 bg-brand/10 mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
              <span className="text-xs font-semibold text-brand-light tracking-wide uppercase">
                Courses · Templates · Edit Services
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                         font-black leading-none tracking-tight mb-6 animate-fade-in"
              style={{ animationDelay: "80ms" }}
            >
              Edit like
              <br />
              <span className="text-gradient-brand">no one</span>
              <br />
              else does.
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed
                         mb-10 animate-fade-in"
              style={{ animationDelay: "160ms" }}
            >
              Premium editing courses, motion templates, and cinematic resources — 
              built for creators who want to stand out, not blend in.
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3 animate-fade-in"
              style={{ animationDelay: "240ms" }}
            >
              <Button
                variant="cta"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                asChild
              >
                <Link href="/courses">Browse Courses</Link>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Play className="w-4 h-4 fill-current" />}
                asChild
              >
                <Link href="/portfolio">Watch Work</Link>
              </Button>
            </div>

            {/* Social proof — star row */}
            <div
              className="flex items-center gap-3 mt-10 animate-fade-in"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-sm text-text-muted">
                Trusted by{" "}
                <span className="text-text-primary font-semibold">
                  {stats.students > 0
                    ? `${stats.students.toLocaleString("en-IN")}+`
                    : "1,000+"}
                </span>{" "}
                creators
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex
                        flex-col items-center gap-2 text-text-muted animate-bounce">
          <span className="text-2xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </div>
      </section>

      {/* ============================================================
          STATS BAR
          ============================================================ */}
      <section
        className="border-y border-bg-border bg-bg-surface"
        aria-label="Platform statistics"
      >
        <div className="section-container py-8">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0
                         md:divide-x divide-bg-border">
            <StatItem
              value={`${stats.courses || "10"}+`}
              label="Courses"
              icon={<BookOpen className="w-4 h-4" />}
            />
            <StatItem
              value={`${stats.templates || "50"}+`}
              label="Templates"
              icon={<Package className="w-4 h-4" />}
            />
            <StatItem
              value={`${stats.students > 0 ? stats.students.toLocaleString("en-IN") : "1,000"}+`}
              label="Students"
              icon={<Users className="w-4 h-4" />}
            />
            <StatItem
              value="4.9★"
              label="Avg. Rating"
              icon={<Star className="w-4 h-4" />}
              accent
            />
          </dl>
        </div>
      </section>

      {/* ============================================================
          WHAT WE OFFER — Section
          ============================================================ */}
      <section className="section-padding">
        <div className="section-container">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-light mb-3">
              What&apos;s Inside
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-text-primary mb-4">
              Everything you need to{" "}
              <span className="text-gradient-brand">level up</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              From structured courses to plug-and-play templates — built for the way
              modern creators actually work.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OfferingCard
              icon="🎬"
              title="Editing Courses"
              description="In-depth video courses covering color grading, motion graphics, cinematic cuts, and advanced Premiere Pro techniques."
              href="/courses"
              cta="View Courses"
              highlight
            />
            <OfferingCard
              icon="⚡"
              title="Premium Templates"
              description="Plug-and-play Premiere Pro & After Effects templates, LUTs, and presets. Download, customize, publish."
              href="/templates"
              cta="Browse Templates"
            />
            <OfferingCard
              icon="✂️"
              title="Edit Services"
              description="Submit your raw footage and let STIGMABOY edit it. Custom pricing based on your project scope."
              href="/contact#edit"
              cta="Request Edit"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section className="section-padding">
        <div className="section-container">
          <div className="relative overflow-hidden rounded-3xl bg-brand p-10 md:p-16 text-center">
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15), transparent 70%)",
              }}
              aria-hidden="true"
            />

            <div className="relative">
              <h2 className="font-display text-3xl md:text-5xl font-black text-white mb-4">
                Start your first course free
              </h2>
              <p className="text-white/75 text-lg mb-8 max-w-lg mx-auto">
                Download free resources and preview every course before you buy.
                No commitment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="cta" size="lg" asChild>
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white/15 text-white border border-white/25 hover:bg-white/25"
                  asChild
                >
                  <Link href="/resources">Free Resources</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatItem({
  value,
  label,
  icon,
  accent = false,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center md:items-start gap-1 md:px-10">
      <div className={`flex items-center gap-1.5 mb-1 ${accent ? "text-accent" : "text-brand-light"}`}>
        {icon}
        <span className="text-2xs font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </span>
      </div>
      <dt className="sr-only">{label}</dt>
      <dd
        className={`font-display font-black text-3xl md:text-4xl tracking-tight
                    ${accent ? "text-gradient-accent" : "text-text-primary"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function OfferingCard({
  icon,
  title,
  description,
  href,
  cta,
  highlight = false,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col p-8 rounded-2xl border
                  transition-all duration-300 hover:-translate-y-1
                  ${
                    highlight
                      ? "bg-brand/8 border-brand/30 hover:border-brand/60 hover:shadow-brand-glow"
                      : "bg-bg-surface border-bg-border hover:border-brand/25 card-base"
                  }`}
    >
      {highlight && (
        <span className="absolute top-4 right-4 badge bg-brand/20 text-brand-light border-brand/30 text-2xs">
          Most Popular
        </span>
      )}

      <span className="text-4xl mb-5" role="img" aria-hidden="true">
        {icon}
      </span>

      <h3 className="font-display text-xl font-bold text-text-primary mb-3">
        {title}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-6">
        {description}
      </p>

      <span
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-light
                   group-hover:gap-3 transition-all duration-200"
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}
