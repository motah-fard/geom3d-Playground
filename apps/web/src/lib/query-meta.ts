import type { QueryType } from "@/types/geometry";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type QueryMeta = {
  category: "Foundations" | "Project" | "Intersect" | "Measure" | "Growth & Form";
  title: string;
  shortTitle: string;
  description: string;
  instruction: string;
  accent: string;
  difficulty: Difficulty;
  emoji?: string;
  // Chapters worth having learned first — surfaced as a "Recommended
  // first" hint when opening this chapter before those are done. Only
  // the Advanced-difficulty chapters have these; the rest stand alone.
  prerequisites?: QueryType[];
  // Lateral connections surfaced as a "Related" strip at the bottom of the
  // chapter — a curated, deliberately small set of genuinely illuminating
  // pairings (the same curve rotated into a surface, the same shape's 2D
  // and 3D forms, a shared underlying law), not an attempt to link every
  // chapter to every other one.
  related?: QueryType[];
};

export const QUERY_META: Record<QueryType, QueryMeta> = {
  "angles": {
    category: "Foundations",
    title: "Angles",
    shortTitle: "Angles",
    description: "Two rays and a shared starting point — spin one around and watch the angle swing from a tight acute wedge all the way to a wraparound reflex angle. Every triangle, every polygon, every camera turn in your favorite game starts right here.",
    instruction: "Grab ray B and spin it around like a clock hand — watch the angle and its name change live.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "📐",
    related: ["regular-polygon", "pythagorean-theorem"],
  },
  "pythagorean-theorem": {
    category: "Foundations",
    title: "The Pythagorean theorem",
    shortTitle: "Pythagorean theorem",
    description: "The most famous rule in all of geometry, hiding in plain sight: build a square on each side of a right triangle, and the two small squares always add up to exactly the big one. a²+b²=c² — works every single time, no exceptions.",
    instruction: "Stretch the two legs and watch the hypotenuse — and all three squares — grow to match.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "🔺",
  },
  "right-triangle-trig": {
    category: "Foundations",
    title: "Right-triangle trigonometry",
    shortTitle: "Right-triangle trig",
    description: "sin, cos, and tan look intimidating written down, but they're really just three simple ratios hiding inside every right triangle. Once it clicks, it never un-clicks.",
    instruction: "Slide θ up and down and watch sin, cos, and tan race to keep up.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "📈",
  },
  "circle-measures": {
    category: "Foundations",
    title: "Circles",
    shortTitle: "Circles",
    description: "Pizza slices, pie charts, and Ferris wheels are all secretly circle math. Circumference, area, arc length, sector area — one shape, four superpowers, all exact multiples of π.",
    instruction: "Resize the circle with R, then drag the wedge's edge to carve out your own slice.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "🍕",
  },
  "regular-polygon": {
    category: "Foundations",
    title: "Regular polygons",
    shortTitle: "Regular polygons",
    description: "A stop sign, a soccer ball panel, a honeycomb cell — regular polygons are everywhere once you start looking. Keep adding sides and watch the shape round itself into an almost-perfect circle.",
    instruction: "Drag N to add sides one at a time, or R to blow the whole shape up bigger.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "⬡",
  },
  "transformations": {
    category: "Foundations",
    title: "Transformations",
    shortTitle: "Transformations",
    description: "Slide it, spin it, and blow it up bigger — do all three to a triangle at once, and something you might not expect stays exactly, perfectly the same.",
    instruction: "Drag T to slide the triangle around, or the handle to spin and resize it.",
    accent: "#5B6EF5",
    difficulty: "Intermediate",
    emoji: "🔄",
  },
  "solids-3d": {
    category: "Foundations",
    title: "3D solids",
    shortTitle: "3D solids",
    description: "Pick a shape — the same one your soup can, your dice, or your ice cream cone are secretly made of — and see how much space it fills up (volume) versus how much wrapping paper it'd take to cover it (surface area).",
    instruction: "Choose a solid from the list, then drag its dimensions and watch volume and surface area keep score.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "📦",
    related: ["cross-sections", "nets"],
  },
  "cross-sections": {
    category: "Foundations",
    title: "Cross-sections",
    shortTitle: "Cross-sections",
    description: "Take a slice through a cone and look at the cut: depending on the angle, you get a circle, an oval, a U-shaped curve, or — if you're bold enough — two curves at once. All four classical conic sections are hiding inside one shape.",
    instruction: "Tilt the slicing plane and watch the cut morph between all four conic sections.",
    accent: "#5B6EF5",
    difficulty: "Intermediate",
    emoji: "🔪",
  },
  "nets": {
    category: "Foundations",
    title: "Nets",
    shortTitle: "Nets",
    description: "Every cardboard box starts out flat. Unfold a die, a cereal box, or a gift box all the way and you get a net — fold it back up and it snaps shut into a real 3D solid, like origami with squares.",
    instruction: "Slide the fold handle from 0 to 1 and watch the flat cross fold itself into a cube.",
    accent: "#5B6EF5",
    difficulty: "Beginner",
    emoji: "🎁",
  },
  "project-point-to-plane": {
    category: "Project",
    title: "Point to plane projection",
    shortTitle: "Point → Plane",
    description: "Find the perpendicular projection of a point onto a plane.",
    instruction: "Drag P to explore. Shift-drag changes its height.",
    accent: "#B58CFF",
    difficulty: "Beginner",
  },
  "intersect-ray-plane": {
    category: "Intersect",
    title: "Ray and plane intersection",
    shortTitle: "Ray → Plane",
    description: "Determine whether a directed ray reaches a plane and where.",
    instruction: "Drag origin O, or orbit the scene from empty space.",
    accent: "#38BDF8",
    difficulty: "Beginner",
  },
  "closest-point-segment": {
    category: "Measure",
    title: "Closest point on segment",
    shortTitle: "Point → Segment",
    description: "Find the nearest point on a finite line segment.",
    instruction: "Drag P, A, or B and watch the nearest point update.",
    accent: "#4DD4A8",
    difficulty: "Beginner",
  },
  "segment-segment": {
    category: "Measure",
    title: "Distance between segments",
    shortTitle: "Segment ↔ Segment",
    description: "Find the shortest connection between two finite segments.",
    instruction: "Drag any endpoint to explore intersecting and skew segments.",
    accent: "#4DD4A8",
    difficulty: "Intermediate",
  },
  "intersect-ray-aabb": {
    category: "Intersect",
    title: "Ray and box intersection",
    shortTitle: "Ray → Box",
    description: "Test a ray against an axis-aligned bounding box.",
    instruction: "Drag origin O to move the ray relative to the box.",
    accent: "#38BDF8",
    difficulty: "Intermediate",
  },
  "closest-point-aabb": {
    category: "Measure",
    title: "Closest point on box",
    shortTitle: "Point → Box",
    description: "Clamp a point to the nearest location on or inside a box.",
    instruction: "Drag P outside or through the box to compare distance.",
    accent: "#4DD4A8",
    difficulty: "Beginner",
  },
  "cartesian-transform": {
    category: "Growth & Form",
    title: "Cartesian transformation",
    shortTitle: "Grid warp",
    description: "Warp a growth grid by its corners and watch a form deform with it — after D'Arcy Thompson's On Growth and Form, Ch. XVII.",
    instruction: "Drag any corner of the grid to warp it and the fish outline together.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
  },
  "log-spiral-growth": {
    category: "Growth & Form",
    title: "Logarithmic spiral growth",
    shortTitle: "Log spiral",
    description: "Model shell and horn growth as an equiangular spiral — after On Growth and Form, Ch. XI.",
    instruction: "Drag S along its radius to resize, or T to change the whorl growth ratio.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
    related: ["helical-shell-growth"],
  },
  "cell-packing": {
    category: "Growth & Form",
    title: "Soap-bubble cell packing",
    shortTitle: "Cell packing",
    description: "See a growth center's cell approach the surface-tension-minimizing hexagon — after On Growth and Form, Ch. VI–VII.",
    instruction: "Drag the center point; its cell is the region closer to it than to any neighbor.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
    related: ["bee-cell"],
  },
  "helical-shell-growth": {
    category: "Growth & Form",
    title: "Helical shell growth",
    shortTitle: "Helical shell",
    description: "The 3D generalization of the equiangular spiral — a turreted shell that both widens and rises with each turn, rather than staying flat like a nautilus cross-section — after On Growth and Form, Ch. XI.",
    instruction: "Drag T outward to widen each turn, or up to make it rise — S sets the base radius.",
    accent: "#F3B95F",
    difficulty: "Advanced",
    prerequisites: ["log-spiral-growth"],
    related: ["log-spiral-growth"],
  },
  "square-cube-law": {
    category: "Growth & Form",
    title: "The square-cube law",
    shortTitle: "Square-cube law",
    description: "Scaling a shape up grows its surface by the square but its volume by the cube — the reason a larger animal can't just be a bigger copy of a smaller one — after On Growth and Form, Ch. II, \"On Magnitude\".",
    instruction: "Drag R to resize the sphere and watch its surface-to-volume ratio fall as it grows.",
    accent: "#F3B95F",
    difficulty: "Beginner",
    related: ["allometric-growth"],
  },
  "catenary-arch": {
    category: "Growth & Form",
    title: "The catenary arch",
    shortTitle: "Catenary arch",
    description: "The exact shape a chain takes hanging under its own weight — and, inverted, the ideal pure-compression arch — a curve of mechanical equilibrium rather than growth.",
    instruction: "Drag A to make the hanging curve tauter or slacker over a fixed span.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
    related: ["catenoid"],
  },
  "allometric-growth": {
    category: "Growth & Form",
    title: "Allometric growth",
    shortTitle: "Allometric growth",
    description: "Huxley and Thompson's allometric equation, y = x^k, relating a part's size to the whole as an organism grows — after On Growth and Form, Ch. IV, \"On the Rate of Growth\".",
    instruction: "Drag X to change body size, or K to change how disproportionately the part grows with it.",
    accent: "#F3B95F",
    difficulty: "Beginner",
    related: ["square-cube-law"],
  },
  "phyllotaxis": {
    category: "Growth & Form",
    title: "Phyllotaxis",
    shortTitle: "Phyllotaxis",
    description: "The golden-angle divergence, 137.5°, that packs sunflower seeds and leaf primordia with no gaps and no overlapping spiral arms — the angle worst approximated by any simple fraction.",
    instruction: "Drag D around the dial to change the divergence angle away from golden and watch the spiral arms appear.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
  },
  "logistic-growth": {
    category: "Growth & Form",
    title: "The logistic growth curve",
    shortTitle: "Logistic curve",
    description: "Growth as a function of time rather than of another part — the S-shaped curve of an organism (or population) approaching a ceiling — after On Growth and Form, Ch. III–IV.",
    instruction: "Drag R to change growth rate, or K to change the ceiling it approaches.",
    accent: "#F3B95F",
    difficulty: "Beginner",
  },
  "geodesic-sphere": {
    category: "Growth & Form",
    title: "The geodesic sphere",
    shortTitle: "Geodesic sphere",
    description: "A triangulated lattice sphere, after Thompson's note on geodesics and his comparison of Radiolarian skeletons like Aulonia hexagona to such networks.",
    instruction: "Drag F outward to subdivide the lattice further — Euler's formula V − E + F = 2 always holds.",
    accent: "#F3B95F",
    difficulty: "Advanced",
    prerequisites: ["solids-3d"],
  },
  "whirling-squares": {
    category: "Growth & Form",
    title: "The golden rectangle",
    shortTitle: "Whirling squares",
    description: "Removing the largest square from a golden rectangle always leaves a smaller golden rectangle — the discrete construction behind the continuous equiangular spiral.",
    instruction: "Drag N to add or remove squares from the whirling sequence.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
  },
  "catenoid": {
    category: "Growth & Form",
    title: "The catenoid",
    shortTitle: "Catenoid",
    description: "The actual soap film spanning two coaxial rings — the minimal surface swept by revolving the catenary around its own axis.",
    instruction: "Drag A to change the waist radius and watch the rings and surface area respond.",
    accent: "#F3B95F",
    difficulty: "Advanced",
    prerequisites: ["catenary-arch"],
    related: ["catenary-arch", "helicoid", "cell-packing"],
  },
  "milk-coronet": {
    category: "Growth & Form",
    title: "The milk-drop coronet",
    shortTitle: "Milk coronet",
    description: "Worthington and Edgerton's high-speed photographs of a splash crown breaking into a fixed number of equally spaced points — nature exhausting a circle by a polygon, exactly as Archimedes did to estimate π.",
    instruction: "Drag N to change the number of crown points, or R to resize the rim.",
    accent: "#F3B95F",
    difficulty: "Intermediate",
  },
  "egg-curve": {
    category: "Growth & Form",
    title: "The egg",
    shortTitle: "The egg",
    description: "Thompson's ovoid curve, built the classical way: a round end and a pointed end, each a circle, joined by their common tangent lines — an asymmetric oval two true spheres and a cone frustum could be cut and reassembled into.",
    instruction: "Drag R to resize the round end, or r to resize the pointed end.",
    accent: "#F3B95F",
    difficulty: "Advanced",
    prerequisites: ["circle-measures"],
  },
  "helicoid": {
    category: "Growth & Form",
    title: "The helicoid",
    shortTitle: "Helicoid",
    description: "The twisted-ribbon minimal surface a soap film forms on a helical wire frame — the catenoid's geometric sibling, a screw thread instead of a film between two rings, and isometric to it despite looking nothing alike.",
    instruction: "Drag R to widen the ribbon, or P to change how tightly it twists.",
    accent: "#F3B95F",
    difficulty: "Advanced",
    prerequisites: ["catenoid"],
    related: ["catenoid"],
  },
  "bee-cell": {
    category: "Growth & Form",
    title: "The bee's cell",
    shortTitle: "Bee's cell",
    description: "Réaumur, Maraldi, König, and Maclaurin's problem, which Thompson revisits in his account of the honeycomb: closing a hexagonal prism with three rhombi instead of a flat lid saves wax at exactly one trimming depth.",
    instruction: "Drag X to change how far the three alternating corners are trimmed, and watch the total surface area find its minimum.",
    accent: "#F3B95F",
    difficulty: "Advanced",
    prerequisites: ["cell-packing"],
    related: ["cell-packing"],
  },
};

export const QUERY_GROUPS = (["Foundations", "Project", "Intersect", "Measure", "Growth & Form"] as const).map(
  (category) => ({
    category,
    queries: (Object.keys(QUERY_META) as QueryType[]).filter(
      (query) => QUERY_META[query].category === category,
    ),
  }),
);

export type LearningCollectionId = "geometry-foundations" | "3d-geometry" | "computational-geometry" | "growth-form";

const projectIntersectMeasure = QUERY_GROUPS.filter((g) => g.category === "Project" || g.category === "Intersect" || g.category === "Measure").flatMap((g) => g.queries);
const growthFormQueries = QUERY_GROUPS.find((g) => g.category === "Growth & Form")!.queries;

// A presentational grouping on top of `category`, used only by the Learn
// and Explore home screens' "collections" grid — it doesn't touch accent
// colors, the "Seen in nature" vs "Why it matters" split, or anything else
// keyed off `category` itself. Splits the existing "Foundations" category
// into a 2D and a 3D collection (a cleaner cut for browsing than one mixed
// bucket), and folds Project/Intersect/Measure into one "Computational
// Geometry" collection, since each of those three is only 1-3 chapters on
// its own.
export const LEARNING_COLLECTIONS: {
  id: LearningCollectionId;
  title: string;
  tagline: string;
  accent: string;
  emoji: string;
  queries: QueryType[];
}[] = [
  {
    id: "geometry-foundations",
    title: "Geometry Foundations",
    tagline: "Angles, triangles, circles, polygons, and the transformations that move them — the 2D groundwork everything else builds on.",
    accent: "#5B6EF5",
    emoji: "📐",
    queries: ["angles", "pythagorean-theorem", "right-triangle-trig", "circle-measures", "regular-polygon", "transformations"],
  },
  {
    id: "3d-geometry",
    title: "3D Geometry",
    tagline: "Solids, the cuts through them, and the flat nets that fold back up into them.",
    accent: "#5B6EF5",
    emoji: "📦",
    queries: ["solids-3d", "cross-sections", "nets"],
  },
  {
    id: "computational-geometry",
    title: "Computational Geometry",
    tagline: "The spatial queries a 3D engine runs constantly: project a point, intersect a ray, find the closest point.",
    accent: "#38BDF8",
    emoji: "🧭",
    queries: projectIntersectMeasure,
  },
  {
    id: "growth-form",
    title: "Growth & Form",
    tagline: "D’Arcy Thompson’s case that a living thing’s shape owes as much to mathematics as to natural selection.",
    accent: "#F3B95F",
    emoji: "🌿",
    queries: growthFormQueries,
  },
];

// The suggested learning order across every category, from first
// principles to the most advanced Growth & Form chapters — used by the
// guided learning path (as opposed to QUERY_GROUPS, which is grouped
// for free browsing).
export const LEARNING_PATH: QueryType[] = [
  "angles",
  "pythagorean-theorem",
  "right-triangle-trig",
  "circle-measures",
  "regular-polygon",
  "solids-3d",
  "nets",
  "cross-sections",
  "transformations",
  "project-point-to-plane",
  "closest-point-aabb",
  "closest-point-segment",
  "intersect-ray-plane",
  "intersect-ray-aabb",
  "segment-segment",
  "square-cube-law",
  "allometric-growth",
  "logistic-growth",
  "cartesian-transform",
  "log-spiral-growth",
  "cell-packing",
  "catenary-arch",
  "phyllotaxis",
  "whirling-squares",
  "milk-coronet",
  "helical-shell-growth",
  "geodesic-sphere",
  "catenoid",
  "egg-curve",
  "helicoid",
  "bee-cell",
];
