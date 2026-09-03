import type { QueryType } from "@/types/geometry";

export type QueryMeta = {
  category: "Project" | "Intersect" | "Measure" | "Growth & Form";
  title: string;
  shortTitle: string;
  description: string;
  instruction: string;
  accent: string;
};

export const QUERY_META: Record<QueryType, QueryMeta> = {
  "project-point-to-plane": {
    category: "Project",
    title: "Point to plane projection",
    shortTitle: "Point → Plane",
    description: "Find the perpendicular projection of a point onto a plane.",
    instruction: "Drag P to explore. Shift-drag changes its height.",
    accent: "#f472b6",
  },
  "intersect-ray-plane": {
    category: "Intersect",
    title: "Ray and plane intersection",
    shortTitle: "Ray → Plane",
    description: "Determine whether a directed ray reaches a plane and where.",
    instruction: "Drag origin O, or orbit the scene from empty space.",
    accent: "#60a5fa",
  },
  "closest-point-segment": {
    category: "Measure",
    title: "Closest point on segment",
    shortTitle: "Point → Segment",
    description: "Find the nearest point on a finite line segment.",
    instruction: "Drag P, A, or B and watch the nearest point update.",
    accent: "#a78bfa",
  },
  "segment-segment": {
    category: "Measure",
    title: "Distance between segments",
    shortTitle: "Segment ↔ Segment",
    description: "Find the shortest connection between two finite segments.",
    instruction: "Drag any endpoint to explore intersecting and skew segments.",
    accent: "#22d3ee",
  },
  "intersect-ray-aabb": {
    category: "Intersect",
    title: "Ray and box intersection",
    shortTitle: "Ray → Box",
    description: "Test a ray against an axis-aligned bounding box.",
    instruction: "Drag origin O to move the ray relative to the box.",
    accent: "#38bdf8",
  },
  "closest-point-aabb": {
    category: "Measure",
    title: "Closest point on box",
    shortTitle: "Point → Box",
    description: "Clamp a point to the nearest location on or inside a box.",
    instruction: "Drag P outside or through the box to compare distance.",
    accent: "#34d399",
  },
  "cartesian-transform": {
    category: "Growth & Form",
    title: "Cartesian transformation",
    shortTitle: "Grid warp",
    description: "Warp a growth grid by its corners and watch a form deform with it — after D'Arcy Thompson's On Growth and Form, Ch. XVII.",
    instruction: "Drag any corner of the grid to warp it and the fish outline together.",
    accent: "#fbbf24",
  },
};

export const QUERY_GROUPS = (["Project", "Intersect", "Measure", "Growth & Form"] as const).map(
  (category) => ({
    category,
    queries: (Object.keys(QUERY_META) as QueryType[]).filter(
      (query) => QUERY_META[query].category === category,
    ),
  }),
);
