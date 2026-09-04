import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Set NEXT_PUBLIC_SITE_URL to the real deployed domain (e.g. in Vercel's
// environment variables) once this is live — sitemap.ts and robots.ts
// both read it too, and absolute OG/canonical URLs need a real origin
// to be useful to search engines and link previews.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const TITLE = "geom3d Playground — Learn Geometry Interactively, Free for Students";
const DESCRIPTION =
  "A free, interactive 3D geometry lab for students and teachers: angles, the Pythagorean theorem, trigonometry, circles, transformations, and 16 real growth-and-form chapters inspired by D'Arcy Thompson's On Growth and Form. Drag points, see live formulas, and check your understanding — no account, no paywall.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — geom3d Playground",
  },
  description: DESCRIPTION,
  keywords: [
    "learn geometry",
    "geometry for students",
    "interactive geometry",
    "3D geometry",
    "geometry visualizer",
    "geometry for kids",
    "geometry help",
    "Pythagorean theorem",
    "trigonometry basics",
    "On Growth and Form",
    "D'Arcy Thompson",
    "free geometry app",
    "geometry for teachers",
    "math visualization",
  ],
  authors: [{ name: "Motahareh Shafiei Fard" }],
  applicationName: "geom3d Playground",
  category: "education",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "geom3d Playground",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/logo-mark.png", width: 512, height: 512, alt: "geom3d Playground logo" }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo-mark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "geom3d Playground",
  description: DESCRIPTION,
  url: SITE_URL,
  isAccessibleForFree: true,
  learningResourceType: [
    "Interactive Resource",
    "Simulation",
  ],
  educationalLevel: ["Beginner", "Intermediate", "Advanced"],
  audience: {
    "@type": "EducationalAudience",
    educationalRole: ["student", "teacher"],
  },
  about: [
    { "@type": "Thing", name: "Geometry" },
    { "@type": "Thing", name: "Trigonometry" },
    { "@type": "Thing", name: "3D Geometry" },
  ],
  creator: {
    "@type": "Person",
    name: "Motahareh Shafiei Fard",
  },
  license: "https://polyformproject.org/licenses/noncommercial/1.0.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
