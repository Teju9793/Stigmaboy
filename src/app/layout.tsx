import type { Metadata, Viewport } from "next";
import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

// ============================================================
// FONTS
// ============================================================

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

// ============================================================
// METADATA
// ============================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://stigmaboy.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: "%s — STIGMABOY",
    default: "STIGMABOY — Premium Editing Courses & Templates",
  },
  description:
    "Premium editing courses, motion templates, and creative resources for video creators. Learn color grading, motion graphics, and cinematic editing from STIGMABOY.",
  keywords: [
    "video editing courses",
    "premiere pro templates",
    "after effects templates",
    "color grading",
    "LUTs",
    "motion graphics",
    "editing tutorial",
    "STIGMABOY",
    "creator economy",
  ],
  authors: [{ name: "STIGMABOY" }],
  creator: "STIGMABOY",
  publisher: "STIGMABOY",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    title: "STIGMABOY — Premium Editing Courses & Templates",
    description:
      "Premium editing courses, motion templates, and creative resources for video creators.",
    siteName: "STIGMABOY",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "STIGMABOY — Premium Editing Courses & Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STIGMABOY — Premium Editing Courses & Templates",
    description:
      "Premium editing courses, motion templates, and creative resources for video creators.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0A0F",
};

// ============================================================
// ROOT LAYOUT
// ============================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg-base text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
