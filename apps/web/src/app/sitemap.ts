import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// The app is a single client-rendered page (every chapter is in-page
// state, not a route), so there's only one URL to list today. If
// per-chapter routes (e.g. /learn/angles) are added later for deep
// linking, add one entry per chapter here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
