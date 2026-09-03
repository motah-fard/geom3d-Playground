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
  "log-spiral-growth": {
    category: "Growth & Form",
    title: "Logarithmic spiral growth",
    shortTitle: "Log spiral",
    description: "Model shell and horn growth as an equiangular spiral — after On Growth and Form, Ch. XI.",
    instruction: "Drag S along its radius to resize, or T to change the whorl growth ratio.",
    accent: "#c084fc",
  },
  "cell-packing": {
    category: "Growth & Form",
    title: "Soap-bubble cell packing",
    shortTitle: "Cell packing",
    description: "See a growth center's cell approach the surface-tension-minimizing hexagon — after On Growth and Form, Ch. VI–VII.",
    instruction: "Drag the center point; its cell is the region closer to it than to any neighbor.",
    accent: "#fb923c",
  },
  "helical-shell-growth": {
    category: "Growth & Form",
    title: "Helical shell growth",
    shortTitle: "Helical shell",
    description: "The 3D generalization of the equiangular spiral — a turreted shell that both widens and rises with each turn, rather than staying flat like a nautilus cross-section — after On Growth and Form, Ch. XI.",
    instruction: "Drag T outward to widen each turn, or up to make it rise — S sets the base radius.",
    accent: "#e879f9",
  },
  "square-cube-law": {
    category: "Growth & Form",
    title: "The square-cube law",
    shortTitle: "Square-cube law",
    description: "Scaling a shape up grows its surface by the square but its volume by the cube — the reason a larger animal can't just be a bigger copy of a smaller one — after On Growth and Form, Ch. II, \"On Magnitude\".",
    instruction: "Drag R to resize the sphere and watch its surface-to-volume ratio fall as it grows.",
    accent: "#4ade80",
  },
  "catenary-arch": {
    category: "Growth & Form",
    title: "The catenary arch",
    shortTitle: "Catenary arch",
    description: "The exact shape a chain takes hanging under its own weight — and, inverted, the ideal pure-compression arch — a curve of mechanical equilibrium rather than growth.",
    instruction: "Drag A to make the hanging curve tauter or slacker over a fixed span.",
    accent: "#facc15",
  },
  "allometric-growth": {
    category: "Growth & Form",
    title: "Allometric growth",
    shortTitle: "Allometric growth",
    description: "Huxley and Thompson's allometric equation, y = x^k, relating a part's size to the whole as an organism grows — after On Growth and Form, Ch. IV, \"On the Rate of Growth\".",
    instruction: "Drag X to change body size, or K to change how disproportionately the part grows with it.",
    accent: "#f87171",
  },
  "phyllotaxis": {
    category: "Growth & Form",
    title: "Phyllotaxis",
    shortTitle: "Phyllotaxis",
    description: "The golden-angle divergence, 137.5°, that packs sunflower seeds and leaf primordia with no gaps and no overlapping spiral arms — the angle worst approximated by any simple fraction.",
    instruction: "Drag D around the dial to change the divergence angle away from golden and watch the spiral arms appear.",
    accent: "#eab308",
  },
  "logistic-growth": {
    category: "Growth & Form",
    title: "The logistic growth curve",
    shortTitle: "Logistic curve",
    description: "Growth as a function of time rather than of another part — the S-shaped curve of an organism (or population) approaching a ceiling — after On Growth and Form, Ch. III–IV.",
    instruction: "Drag R to change growth rate, or K to change the ceiling it approaches.",
    accent: "#2dd4bf",
  },
  "geodesic-sphere": {
    category: "Growth & Form",
    title: "The geodesic sphere",
    shortTitle: "Geodesic sphere",
    description: "A triangulated lattice sphere, after Thompson's note on geodesics and his comparison of Radiolarian skeletons like Aulonia hexagona to such networks.",
    instruction: "Drag F outward to subdivide the lattice further — Euler's formula V − E + F = 2 always holds.",
    accent: "#818cf8",
  },
  "whirling-squares": {
    category: "Growth & Form",
    title: "The golden rectangle",
    shortTitle: "Whirling squares",
    description: "Removing the largest square from a golden rectangle always leaves a smaller golden rectangle — the discrete construction behind the continuous equiangular spiral.",
    instruction: "Drag N to add or remove squares from the whirling sequence.",
    accent: "#fb7185",
  },
  "catenoid": {
    category: "Growth & Form",
    title: "The catenoid",
    shortTitle: "Catenoid",
    description: "The actual soap film spanning two coaxial rings — the minimal surface swept by revolving the catenary around its own axis.",
    instruction: "Drag A to change the waist radius and watch the rings and surface area respond.",
    accent: "#0ea5e9",
  },
  "milk-coronet": {
    category: "Growth & Form",
    title: "The milk-drop coronet",
    shortTitle: "Milk coronet",
    description: "Worthington and Edgerton's high-speed photographs of a splash crown breaking into a fixed number of equally spaced points — nature exhausting a circle by a polygon, exactly as Archimedes did to estimate π.",
    instruction: "Drag N to change the number of crown points, or R to resize the rim.",
    accent: "#f8fafc",
  },
  "egg-curve": {
    category: "Growth & Form",
    title: "The egg",
    shortTitle: "The egg",
    description: "Thompson's ovoid curve, built the classical way: a round end and a pointed end, each a circle, joined by their common tangent lines — an asymmetric oval two true spheres and a cone frustum could be cut and reassembled into.",
    instruction: "Drag R to resize the round end, or r to resize the pointed end.",
    accent: "#fdba74",
  },
  "helicoid": {
    category: "Growth & Form",
    title: "The helicoid",
    shortTitle: "Helicoid",
    description: "The twisted-ribbon minimal surface a soap film forms on a helical wire frame — the catenoid's geometric sibling, a screw thread instead of a film between two rings, and isometric to it despite looking nothing alike.",
    instruction: "Drag R to widen the ribbon, or P to change how tightly it twists.",
    accent: "#a5f3fc",
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
