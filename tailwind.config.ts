import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // STIGMABOY Design Tokens
        // Background scale — near-black base, depth layers
        bg: {
          base: "#0A0A0F",       // deepest background
          surface: "#111118",    // cards, panels
          elevated: "#18181F",   // modals, dropdowns
          border: "#2A2A35",     // subtle borders
        },
        // Primary — electric violet (creator energy)
        brand: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
          dark: "#5B21B6",
          glow: "rgba(124,58,237,0.25)",
        },
        // Accent — hot amber (purchase CTAs, highlights)
        accent: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#D97706",
          glow: "rgba(245,158,11,0.2)",
        },
        // Text scale
        text: {
          primary: "#F0F0F8",
          secondary: "#A0A0B8",
          muted: "#5A5A72",
          inverse: "#0A0A0F",
        },
        // Semantic
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      fontFamily: {
        // Display — Syne for headings (geometric, strong)
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        // Body — Inter for readability
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Mono — for code, prices, data
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "brand-glow": "0 0 30px rgba(124,58,237,0.3)",
        "accent-glow": "0 0 30px rgba(245,158,11,0.25)",
        "card": "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(42,42,53,0.8)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.3)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
        "accent-gradient": "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)",
        "hero-grid":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.15), transparent)",
        "card-shimmer":
          "linear-gradient(90deg, transparent, rgba(124,58,237,0.05), transparent)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(124,58,237,0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
