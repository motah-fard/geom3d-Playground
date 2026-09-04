import type { QueryType } from "@/types/geometry";

export type ComprehensionQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// One "predict, then check" question per chapter, testing the actual
// concept rather than trivial recall — answerable by reasoning about
// the math, and ideally by trying it in the scene first.
export const COMPREHENSION_QUESTIONS: Partial<Record<QueryType, ComprehensionQuestion>> = {
  "solids-3d": {
    question: "You double a cube's side length. What happens to its volume?",
    options: ["It doubles", "It quadruples (×4)", "It multiplies by 8"],
    correctIndex: 2,
    explanation: "Volume = side³, and cubing a doubled length gives 2³ = 8 times the volume — the same square-cube law that shows up throughout the Growth & Form chapters.",
  },
  "cross-sections": {
    question: "Why does a hyperbola cross-section show up as two separate curves instead of one?",
    options: ["It's a rendering glitch", "The cutting plane crosses both nappes of the double cone", "Hyperbolas are always drawn as two pieces by convention"],
    correctIndex: 1,
    explanation: "A double cone has two nappes meeting at the apex. A steep enough cutting plane slices through both of them, and each nappe contributes one disconnected branch of the hyperbola.",
  },
  "nets": {
    question: "While the net is folding, what happens to the area of each individual square face?",
    options: ["Each square's area stays exactly the same the whole time", "The squares shrink as they fold, then grow back", "Only the base square keeps its size"],
    correctIndex: 0,
    explanation: "Folding is a rigid rotation around each hinge — it changes a face's orientation and position, never its shape or area. That's exactly why a net can close into a solid with no stretching or gaps.",
  },
  "angles": {
    question: "If ray B sweeps past 180° and keeps going, what happens to the angle?",
    options: ["It becomes negative", "It becomes a reflex angle (180°–360°)", "It resets back to 0°"],
    correctIndex: 1,
    explanation: "Angles from 180° to 360° are called reflex. A reflex angle has no supplement (180° minus it would be negative), which is why the results panel hides that field past 180°.",
  },
  "pythagorean-theorem": {
    question: "If you double both legs a and b, what happens to the hypotenuse c?",
    options: ["c also doubles", "c quadruples", "c increases by a factor of √2"],
    correctIndex: 0,
    explanation: "c = √(a²+b²), so scaling both legs by k scales c by exactly k too: √((ka)²+(kb)²) = k√(a²+b²). Try it — drag both legs to double their length and watch c.",
  },
  "right-triangle-trig": {
    question: "As θ approaches 90°, what happens to tan θ?",
    options: ["It approaches 0", "It approaches 1", "It grows without bound"],
    correctIndex: 2,
    explanation: "tan θ = sin θ / cos θ, and cos θ approaches 0 as θ approaches 90° — dividing by an ever-smaller number sends tan θ toward infinity.",
  },
  "circle-measures": {
    question: "If you double a circle's radius, what happens to its area?",
    options: ["It doubles", "It quadruples", "It increases by a factor of π"],
    correctIndex: 1,
    explanation: "Area = πr², and r is squared — doubling r multiplies the area by 2² = 4.",
  },
  "regular-polygon": {
    question: "As a regular polygon gains more and more sides, what shape does it approach?",
    options: ["A star", "The circle it's inscribed in", "A different, smaller polygon"],
    correctIndex: 1,
    explanation: "Both its area and perimeter converge on the circumscribing circle's — the same exhaustion Archimedes used to bound π, 2000 years before calculus.",
  },
  "transformations": {
    question: "Which of these always stays exactly the same after a translate + rotate + scale transform?",
    options: ["The triangle's side lengths", "The triangle's interior angles", "The triangle's position"],
    correctIndex: 1,
    explanation: "Side lengths change by the scale factor and position changes by the translation and rotation — but every interior angle is preserved exactly. That's what makes it a similarity transform.",
  },
  "project-point-to-plane": {
    question: "If P already lies exactly on the plane, what is the perpendicular distance d?",
    options: ["Undefined", "0", "Equal to |P|"],
    correctIndex: 1,
    explanation: "d is the signed distance along the normal from P to the plane — if P is already on the plane, that distance is exactly zero.",
  },
  "closest-point-aabb": {
    question: "If P is already inside the box, what does the closest point C equal?",
    options: ["The box's center", "P itself", "The nearest corner"],
    correctIndex: 1,
    explanation: "Clamping a value that's already inside the box's range leaves it unchanged — C = clamp(P, min, max) = P when P is already between min and max on every axis.",
  },
  "closest-point-segment": {
    question: "If P's perpendicular projection onto the line falls beyond endpoint B, what is the closest point on the segment?",
    options: ["The projection point, even off the segment", "B itself", "The segment's midpoint"],
    correctIndex: 1,
    explanation: "The parameter t is clamped to [0, 1] before being used, so once the true projection would fall past B (t > 1), the closest point on the finite segment is B.",
  },
  "intersect-ray-plane": {
    question: "If a ray's direction is exactly parallel to the plane (and the ray isn't in the plane), how many intersection points are there?",
    options: ["Exactly 1", "Infinitely many", "Zero"],
    correctIndex: 2,
    explanation: "A parallel ray never reaches the plane — the dot product of its direction and the plane's normal is zero, which is exactly the case this chapter reports as no intersection.",
  },
  "intersect-ray-aabb": {
    question: "If the ray's origin already sits inside the box, does the ray count as hitting it?",
    options: ["Yes, immediately at t = 0", "No — a ray can only hit a box from outside", "Only if it also exits the box"],
    correctIndex: 0,
    explanation: "The entry parameter tMin starts at 0 and only increases if a slab boundary demands it, so a ray starting inside the box registers a hit at t = 0.",
  },
  "segment-segment": {
    question: "If two finite segments actually cross each other in space, what is the shortest distance between them?",
    options: ["Always greater than 0", "Exactly 0", "Half their combined length"],
    correctIndex: 1,
    explanation: "Two segments that truly intersect share at least one point, so the shortest distance between them is exactly zero at that crossing.",
  },
  "square-cube-law": {
    question: "If you scale a shape up by a factor of 3, by what factor does its surface-to-volume ratio change?",
    options: ["It also multiplies by 3", "It divides by 3", "It stays the same"],
    correctIndex: 1,
    explanation: "Surface area scales as L² and volume as L³, so the ratio S/V scales as 1/L — scaling up by 3 divides the ratio by 3, not multiplies it.",
  },
  "allometric-growth": {
    question: "In y = xᵏ, which value of k means the part grows in exactly the same proportion as the whole body (isometric growth)?",
    options: ["k = 0", "k = 1", "k = 2"],
    correctIndex: 1,
    explanation: "At k = 1, y = x exactly, so the part-to-whole ratio y/x = 1 stays constant at every size — no change in proportion as the body grows.",
  },
  "logistic-growth": {
    question: "At what point does the logistic curve grow fastest?",
    options: ["Right at the very start (t = 0)", "Exactly halfway to the ceiling (N = K/2)", "Just before it reaches the ceiling"],
    correctIndex: 1,
    explanation: "The maximum growth rate, rK/4, occurs exactly at the inflection point where N = K/2 — growth is slower both before and after that point.",
  },
  "cartesian-transform": {
    question: "If you stretch one corner of the grid far outward, what happens to the fish outline drawn on it?",
    options: ["It stays exactly the same shape", "It warps along with the grid, stretching toward that corner", "It disappears"],
    correctIndex: 1,
    explanation: "The fish is defined in the grid's own (u,v) coordinates, so it's carried along by whatever bilinear map the four corners define — this is Thompson's whole method for comparing related forms.",
  },
  "log-spiral-growth": {
    question: "What makes a logarithmic (equiangular) spiral different from an arbitrary curve that just spirals outward?",
    options: ["It crosses every radius line at the same angle", "It always has a 90° pitch", "It never changes size"],
    correctIndex: 0,
    explanation: "That constant crossing angle is the defining property — it's exactly what lets a shell grow by adding material only at its margin while never changing its overall shape.",
  },
  "cell-packing": {
    question: "What shape does a cell's territory approach when growth centers sit in a regular hexagonal grid?",
    options: ["A perfect circle", "A regular hexagon", "A square"],
    correctIndex: 1,
    explanation: "A centered cell in a regular hexagonal arrangement is itself a regular hexagon — the surface-tension equilibrium shape, scoring close to the isoperimetric ideal.",
  },
  "catenary-arch": {
    question: "Turned upside down, what is the catenary curve ideal for?",
    options: ["A cable under pure tension", "An arch carrying pure compression, with no bending", "A shape that resonates at a fixed frequency"],
    correctIndex: 1,
    explanation: "The hanging-chain shape, inverted, is the one arch profile that carries its load in pure compression along its length, with no bending stress anywhere.",
  },
  "phyllotaxis": {
    question: "Why does the golden angle (≈137.5°) keep sunflower seeds from lining up into visible straight arms?",
    options: ["It's exactly half of 360°", "It's the angle worst approximated by any simple fraction", "It matches the golden ratio squared"],
    correctIndex: 1,
    explanation: "Any angle close to a simple fraction of a full turn (like 90° or 120°) makes seeds line up into visible spiral arms. The golden angle resists every such approximation, so no gaps or arms appear.",
  },
  "whirling-squares": {
    question: "After removing the largest square from a golden rectangle, what is the leftover shape?",
    options: ["A smaller golden rectangle, rotated a quarter turn", "A regular pentagon", "An irregular shape with no special properties"],
    correctIndex: 0,
    explanation: "Only the golden ratio has this exact self-similar property — the remainder is always a smaller copy of the same rectangle, which is what lets the construction repeat forever.",
  },
  "milk-coronet": {
    question: "As the number of crown points N increases, what happens to the gap between the inscribed polygon's perimeter and the true circle's circumference?",
    options: ["It grows", "It shrinks toward zero", "It stays constant"],
    correctIndex: 1,
    explanation: "The deficit shrinks like 1/N² — the same exhaustion method Archimedes used with inscribed polygons to bound π, millennia before calculus existed.",
  },
  "helical-shell-growth": {
    question: "What's the key difference between a turreted (helical) shell and a flat, nautilus-style spiral?",
    options: ["The helical shell also rises along an axis as it winds", "The helical shell doesn't widen at all", "Only the nautilus shell rises"],
    correctIndex: 0,
    explanation: "Set the rise to zero in this chapter and you get exactly the flat equiangular spiral — the turreted shell is that same widening pattern with a climb added.",
  },
  "geodesic-sphere": {
    question: "No matter how finely you subdivide the geodesic sphere's lattice, what stays exactly true?",
    options: ["The number of vertices stays the same", "V − E + F always equals 2", "Every face is equilateral"],
    correctIndex: 1,
    explanation: "Euler's formula holds for any sphere-like mesh regardless of how it's triangulated — a topological fact, not a coincidence of this particular construction.",
  },
  "catenoid": {
    question: "Of every possible surface spanning two coaxial rings, what's special about the catenoid?",
    options: ["It has the most surface area", "It has the least possible surface area", "It always forms a cylinder"],
    correctIndex: 1,
    explanation: "It's a genuine minimal surface — which is exactly why a real soap film, which naturally settles into the lowest-energy (least-area) shape, forms this curve when stretched between two rings.",
  },
  "egg-curve": {
    question: "The egg in this chapter is built from which two simpler shapes?",
    options: ["Two circles of different sizes joined by their common tangent lines", "An ellipse stretched at one end", "A parabola revolved around its axis"],
    correctIndex: 0,
    explanation: "It's the classic compass-and-straightedge method for drafting an oval: a small circle and a large circle, joined smoothly by their two shared external tangent lines.",
  },
  "helicoid": {
    question: "What happens if you bend a helicoid flat along its length without stretching it?",
    options: ["It tears apart", "It becomes a catenoid — the two are isometric", "It becomes a flat disk"],
    correctIndex: 1,
    explanation: "The helicoid and catenoid are a classic \"Bonnet pair\": surfaces with the same intrinsic geometry (and the same mean curvature, zero) that can be continuously bent into one another.",
  },
  "bee-cell": {
    question: "Why don't bees close their hexagonal cells with a flat lid?",
    options: ["A flat lid would use more wax than the three-rhombi cap at the right trim depth", "A flat lid would be too weak structurally", "Bees physically can't build flat surfaces"],
    correctIndex: 0,
    explanation: "At exactly one trimming depth (x = 1/(2√2) here), the three-rhombi cap uses strictly less total wax than a flat lid would — first proven with calculus by Maclaurin in 1743.",
  },
};
