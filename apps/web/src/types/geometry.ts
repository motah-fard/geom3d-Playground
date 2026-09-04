// =======================
// Base types
// =======================

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type Vec3Tuple = [number, number, number];

// =======================
// Geometry primitives
// =======================

export type Plane = {
  point: Vec3;
  normal: Vec3;
};

export type Ray = {
  origin: Vec3;
  dir: Vec3;
};

export type Segment = {
  a: Vec3;
  b: Vec3;
};

export type AABB = {
  min: Vec3;
  max: Vec3;
};

// =======================
// Foundations — the core K-12/intro geometry curriculum: angles,
// the Pythagorean theorem, right-triangle trigonometry, circles,
// regular polygons, and rigid/similarity transformations.
// =======================

export type AngleClassification = "acute" | "right" | "obtuse" | "straight" | "reflex";

export type AngleResponse = {
  angleDeg: number;
  classification: AngleClassification;
  complementDeg: number | null;
  supplementDeg: number | null;
};

export type PythagoreanResponse = {
  legA: number;
  legB: number;
  hypotenuse: number;
  triangleType: "isosceles" | "scalene";
};

export type RightTriangleTrigResponse = {
  angleDeg: number;
  sin: number;
  cos: number;
  tan: number;
  opposite: number;
  adjacent: number;
  hypotenuse: number;
};

export type CircleMeasuresResponse = {
  radius: number;
  circumference: number;
  area: number;
  centralAngleDeg: number;
  arcLength: number;
  sectorArea: number;
};

export type RegularPolygonResponse = {
  sides: number;
  circumradius: number;
  area: number;
  perimeter: number;
  interiorAngleDeg: number;
};

export type TransformationsResponse = {
  translationX: number;
  translationY: number;
  rotationDeg: number;
  scale: number;
  sampleAngleBeforeDeg: number;
  sampleAngleAfterDeg: number;
};

// =======================
// 3D solids — volume and surface area of the standard set every
// intro-geometry curriculum covers: cube, rectangular prism, cylinder,
// cone, sphere, and square pyramid. `dimA`/`dimB`/`dimC` are generic
// (their meaning depends on `solidType`) so every solid shares one
// response shape and one set of draggable inputs.
// =======================

export type SolidType = "cube" | "box" | "cylinder" | "cone" | "sphere" | "pyramid";

export type SolidsResponse = {
  solidType: SolidType;
  dimA: number;
  dimB: number;
  dimC: number;
  volume: number;
  surfaceArea: number;
  slantHeight: number | null;
};

// =======================
// Cross-sections — the classical conic sections, produced by slicing a
// double cone with a plane at a variable tilt. The tilt angle relative
// to the cone's own half-angle determines whether the cut is a circle,
// ellipse, parabola, or hyperbola.
// =======================

export type ConicType = "circle" | "ellipse" | "parabola" | "hyperbola";

export type CrossSectionResponse = {
  coneHalfAngleDeg: number;
  planeTiltDeg: number;
  planeOffset: number;
  conicType: ConicType;
  discriminant: number;
};

// =======================
// Nets — a cube's net (six squares hinged together) folding
// continuously from flat into the solid it forms.
// =======================

export type NetResponse = {
  side: number;
  foldFraction: number;
  isFlat: boolean;
  isFolded: boolean;
};

// =======================
// Requests
// =======================

export type ProjectPointToPlaneRequest = {
  point: Vec3;
  plane: Plane;
};

export type IntersectRayPlaneRequest = {
  ray: Ray;
  plane: Plane;
};

export type ClosestPointSegmentRequest = {
  point: Vec3;
  segment: Segment;
};

export type SegmentSegmentRequest = {
  a1: Vec3;
  a2: Vec3;
  b1: Vec3;
  b2: Vec3;
};

export type IntersectRayAABBRequest = {
  ray: Ray;
  aabb: AABB;
};

export type ClosestPointAABBRequest = {
  point: Vec3;
  aabb: AABB;
};

// =======================
// Responses (FIXED)
// =======================

// 🔥 unified
export type ProjectPointToPlaneResponse = {
  projectedPoint: Vec3;
  distance: number;
};

// =======================
// Unified result shape
// =======================

export type PointResult = {
  point: Vec3;
  distance?: number;
};

// add hit + t
export type IntersectRayPlaneResponse = {
  hit: boolean;
  point: Vec3;
  t: number;
};

export function toTuple(v?: Vec3): Vec3Tuple {
  if (!v) return [0, 0, 0]; // fallback instead of exploding
  return [v.x, v.y, v.z];
}
export type SegmentSegmentResponse = {
  pointA: Vec3;
  pointB: Vec3;
  distance: number;
};

export type ClosestPointSegmentResponse = {
  point: Vec3;
  distance: number;
};

export type IntersectRayAABBResponse = {
  hit: boolean;
  tMin: number;
  tMax: number;
  point: Vec3;
};

export type ClosestPointAABBResponse = {
  point: Vec3;
  distance: number;
};

// =======================
// Cartesian transformation (On Growth and Form, Ch. XVII)
// =======================

export type CartesianTransformCorners = {
  p00: Vec3;
  p10: Vec3;
  p01: Vec3;
  p11: Vec3;
};

export type CartesianTransformResponse = {
  currentArea: number;
  referenceArea: number;
  areaRatio: number;
  elongation: number;
};

// =======================
// Logarithmic (equiangular) spiral growth (On Growth and Form, Ch. XI)
// =======================

export type LogSpiralResponse = {
  a: number;
  b: number;
  growthRatio: number;
  pitchAngleDeg: number;
};

// =======================
// Helical (turreted) shell growth — the 3D generalization of the flat
// equiangular spiral, where the curve also rises as it winds
// (On Growth and Form, Ch. XI).
// =======================

export type HelicalShellResponse = {
  a: number;
  b: number;
  c: number;
  growthRatio: number;
  risePerTurn: number;
  pitchAngleDeg: number;
};

// =======================
// The square-cube law (On Growth and Form, Ch. II, "On Magnitude")
// =======================

export type MagnitudeScalingResponse = {
  radius: number;
  surfaceArea: number;
  volume: number;
  ratio: number;
};

// =======================
// The catenary arch (mechanical equilibrium of a hanging chain,
// discussed alongside Thompson's treatment of mechanical efficiency)
// =======================

export type CatenaryResponse = {
  a: number;
  sag: number;
  arcLength: number;
};

// =======================
// Allometric growth (On Growth and Form, Ch. IV, "On the Rate of Growth")
// =======================

export type AllometricGrowthResponse = {
  x: number;
  k: number;
  y: number;
  ratio: number;
};

// =======================
// Phyllotaxis — the golden-angle divergence that packs sunflower seeds
// and leaf primordia without gaps or overlaps.
// =======================

export type PhyllotaxisResponse = {
  divergenceDeg: number;
  goldenAngleDeg: number;
  deviationDeg: number;
};

// =======================
// The logistic growth curve (On Growth and Form, Ch. III–IV, growth
// as a function of time rather than of another part).
// =======================

export type LogisticGrowthResponse = {
  r: number;
  k: number;
  inflectionTime: number;
  maxGrowthRate: number;
};

// =======================
// The geodesic sphere — the triangulated lattice Thompson likens to
// the skeletons of Radiolaria such as Aulonia hexagona.
// =======================

export type GeodesicSphereResponse = {
  detail: number;
  vertices: number;
  edges: number;
  faces: number;
  eulerCharacteristic: number;
};

// =======================
// The golden rectangle / whirling squares construction — the discrete
// geometric origin of the equiangular spiral from continued similar
// rectangles.
// =======================

export type WhirlingSquaresResponse = {
  count: number;
  ratio: number;
  totalArcLength: number;
};

// =======================
// The catenoid — the actual 3D minimal surface a soap film forms
// between two coaxial rings, the surface of revolution of the catenary.
// =======================

export type CatenoidResponse = {
  a: number;
  rimRadius: number;
  surfaceArea: number;
};

// =======================
// Soap-bubble / cell packing (On Growth and Form, Ch. VI–VII)
// =======================

export type CellPackingResponse = {
  area: number;
  perimeter: number;
  isoperimetricQuotient: number;
  sides: number;
};

// =======================
// The milk-drop coronet — Worthington and Edgerton's high-speed
// photographs of a splash crown, discussed by Thompson alongside other
// surface-tension phenomena. The crown's N equally spaced points are an
// N-gon inscribed in the rim circle; its perimeter falls short of the
// smooth circumference by an amount that shrinks like 1/N² — Archimedes'
// method of exhausting a circle by polygons, run by nature.
// =======================

export type MilkCoronetResponse = {
  radius: number;
  points: number;
  circumference: number;
  polygonPerimeter: number;
  circleDeficit: number;
};

// =======================
// The egg — Thompson's discussion of ovoid curves as circles of two
// different curvatures smoothly joined, built here from the classic
// compass-and-straightedge two-circle oval: a small and a large circle
// joined by their common external tangent lines.
// =======================

export type EggCurveResponse = {
  bigRadius: number;
  smallRadius: number;
  tangentLength: number;
  tiltAngleDeg: number;
  perimeter: number;
  surfaceArea: number;
};

// =======================
// The helicoid — the twisted-ribbon minimal surface a soap film forms on
// a helical wire frame, the geometric sibling of the catenoid (the two
// are a classic "Bonnet pair": isometric surfaces of equal mean
// curvature, zero, related by bending one into the other).
// =======================

export type HelicoidResponse = {
  radius: number;
  c: number;
  risePerTurn: number;
  area: number;
};

// =======================
// The bee's cell — Thompson's account of the honeycomb, and the classic
// problem (Réaumur, Maraldi, König, Maclaurin) of the trihedral angle
// that closes a hexagonal prism with three rhombi for the least wax:
// pushing three alternating corners down by a rise x while a shared
// apex rises by the same x turns each closing rhombus's diagonals into
// a fixed hexagon diagonal and a diagonal that grows with x, trading
// rhombus area against shortened prism walls until a genuine minimum.
// =======================

export type BeeCellResponse = {
  x: number;
  ridgeAngleDeg: number;
  rhombusArea: number;
  totalSurfaceArea: number;
  optimalX: number;
  optimalRidgeAngleDeg: number;
};

// The full set of query types the playground supports. Kept here (rather
// than inline in the store) so it can be imported anywhere a properly
// typed QueryType is needed instead of casting through `any`.
export type QueryType =
  | "angles"
  | "pythagorean-theorem"
  | "right-triangle-trig"
  | "circle-measures"
  | "regular-polygon"
  | "transformations"
  | "solids-3d"
  | "cross-sections"
  | "nets"
  | "project-point-to-plane"
  | "intersect-ray-plane"
  | "closest-point-segment"
  | "segment-segment"
  | "intersect-ray-aabb"
  | "closest-point-aabb"
  | "cartesian-transform"
  | "log-spiral-growth"
  | "cell-packing"
  | "helical-shell-growth"
  | "square-cube-law"
  | "catenary-arch"
  | "allometric-growth"
  | "phyllotaxis"
  | "logistic-growth"
  | "geodesic-sphere"
  | "whirling-squares"
  | "catenoid"
  | "milk-coronet"
  | "egg-curve"
  | "helicoid"
  | "bee-cell";
