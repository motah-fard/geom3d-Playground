import type {
  AllometricGrowthResponse,
  AngleClassification,
  AngleResponse,
  BeeCellResponse,
  CartesianTransformCorners,
  CartesianTransformResponse,
  CatenaryResponse,
  CatenoidResponse,
  CellPackingResponse,
  CircleMeasuresResponse,
  ClosestPointAABBRequest,
  ClosestPointAABBResponse,
  ClosestPointSegmentRequest,
  ClosestPointSegmentResponse,
  ConicType,
  CrossSectionResponse,
  EggCurveResponse,
  GeodesicSphereResponse,
  HelicoidResponse,
  IntersectRayAABBRequest,
  IntersectRayAABBResponse,
  HelicalShellResponse,
  IntersectRayPlaneRequest,
  IntersectRayPlaneResponse,
  LogisticGrowthResponse,
  LogSpiralResponse,
  MagnitudeScalingResponse,
  MilkCoronetResponse,
  NetResponse,
  PhyllotaxisResponse,
  ProjectPointToPlaneRequest,
  ProjectPointToPlaneResponse,
  PythagoreanResponse,
  RegularPolygonResponse,
  RightTriangleTrigResponse,
  SegmentSegmentRequest,
  SegmentSegmentResponse,
  SolidsResponse,
  SolidType,
  TransformationsResponse,
  Vec3,
  WhirlingSquaresResponse,
} from "@/types/geometry";

const EPSILON = 1e-9;
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (v: Vec3, amount: number): Vec3 => ({ x: v.x * amount, y: v.y * amount, z: v.z * amount });
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const length = (v: Vec3) => Math.hypot(v.x, v.y, v.z);
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

// =======================
// Foundations — Angles. One ray fixed along the positive X axis, one
// ray (B) draggable freely around the vertex; the swept angle is
// measured counterclockwise from the fixed ray, in [0°, 360°), so
// reflex angles are just as representable as acute ones.
// =======================

const ANGLE_EPSILON_DEG = 1e-6;

export function localAngle(rayB: Vec3): AngleResponse {
  let angleDeg = Math.atan2(rayB.y, rayB.x) * (180 / Math.PI);
  if (angleDeg < 0) angleDeg += 360;

  const classification: AngleClassification =
    Math.abs(angleDeg - 90) < ANGLE_EPSILON_DEG ? "right" :
    Math.abs(angleDeg - 180) < ANGLE_EPSILON_DEG ? "straight" :
    angleDeg < 90 ? "acute" :
    angleDeg < 180 ? "obtuse" : "reflex";

  const complementDeg = angleDeg <= 90 ? 90 - angleDeg : null;
  const supplementDeg = angleDeg <= 180 ? 180 - angleDeg : null;

  return { angleDeg, classification, complementDeg, supplementDeg };
}

// =======================
// Foundations — The Pythagorean theorem. A right angle is fixed at the
// origin; the two legs run along the axes, so the hypotenuse and its
// square follow directly from a² + b² = c².
// =======================

export function localPythagorean(legAPoint: Vec3, legBPoint: Vec3): PythagoreanResponse {
  const legA = Math.max(Math.hypot(legAPoint.x, legAPoint.y), EPSILON);
  const legB = Math.max(Math.hypot(legBPoint.x, legBPoint.y), EPSILON);
  const hypotenuse = Math.sqrt(legA * legA + legB * legB);
  const triangleType = Math.abs(legA - legB) < 1e-6 ? "isosceles" : "scalene";
  return { legA, legB, hypotenuse, triangleType };
}

// =======================
// Foundations — Right-triangle trigonometry. A fixed hypotenuse of
// length H, swept through an angle θ ∈ (0°, 90°): sin, cos, and tan
// are just the resulting opposite, adjacent, and their ratios.
// =======================

export const RIGHT_TRIANGLE_TRIG_HYPOTENUSE = 3;

export function localRightTriangleTrig(anglePoint: Vec3): RightTriangleTrigResponse {
  const rawDeg = Math.atan2(Math.abs(anglePoint.y), Math.max(anglePoint.x, EPSILON)) * (180 / Math.PI);
  const angleDeg = Math.max(1, Math.min(89, rawDeg));
  const angleRad = angleDeg * (Math.PI / 180);
  const hypotenuse = RIGHT_TRIANGLE_TRIG_HYPOTENUSE;
  const sinValue = Math.sin(angleRad);
  const cosValue = Math.cos(angleRad);
  const tanValue = Math.tan(angleRad);
  return {
    angleDeg,
    sin: sinValue,
    cos: cosValue,
    tan: tanValue,
    opposite: hypotenuse * sinValue,
    adjacent: hypotenuse * cosValue,
    hypotenuse,
  };
}

// =======================
// Foundations — Circles. Circumference and area from the radius;
// arc length and sector area from a central angle swept out of it.
// =======================

export function localCircleMeasures(radiusPoint: Vec3, anglePoint: Vec3): CircleMeasuresResponse {
  const radius = Math.max(Math.hypot(radiusPoint.x, radiusPoint.y), EPSILON);
  let centralAngleDeg = Math.atan2(anglePoint.y, anglePoint.x) * (180 / Math.PI);
  if (centralAngleDeg <= 0) centralAngleDeg += 360;
  const centralAngleRad = centralAngleDeg * (Math.PI / 180);
  return {
    radius,
    circumference: 2 * Math.PI * radius,
    area: Math.PI * radius * radius,
    centralAngleDeg,
    arcLength: radius * centralAngleRad,
    sectorArea: 0.5 * radius * radius * centralAngleRad,
  };
}

// =======================
// Foundations — Regular polygons. A polygon of N sides inscribed in a
// circle of radius R: its exact perimeter and area, its interior
// angle, and — as N grows — its convergence toward that same circle's
// own circumference and area.
// =======================

export const REGULAR_POLYGON_MIN_SIDES = 3;
export const REGULAR_POLYGON_MAX_SIDES = 20;

export function regularPolygonVertex(index: number, sides: number, circumradius: number): Vec3 {
  const angle = (2 * Math.PI * index) / sides;
  return { x: circumradius * Math.cos(angle), y: circumradius * Math.sin(angle), z: 0 };
}

export function localRegularPolygon(sidesPoint: Vec3, radiusPoint: Vec3): RegularPolygonResponse {
  const rawSides = Math.max(Math.hypot(sidesPoint.x, sidesPoint.y), REGULAR_POLYGON_MIN_SIDES);
  const sides = Math.max(REGULAR_POLYGON_MIN_SIDES, Math.min(REGULAR_POLYGON_MAX_SIDES, Math.round(rawSides)));
  const circumradius = Math.max(Math.hypot(radiusPoint.x, radiusPoint.y), EPSILON);
  const perimeter = sides * 2 * circumradius * Math.sin(Math.PI / sides);
  const area = 0.5 * sides * circumradius * circumradius * Math.sin((2 * Math.PI) / sides);
  const interiorAngleDeg = ((sides - 2) * 180) / sides;
  return { sides, circumradius, area, perimeter, interiorAngleDeg };
}

// =======================
// Foundations — Transformations. A fixed reference triangle is
// translated, rotated, and uniformly scaled all at once — a similarity
// transformation, which moves and resizes a shape while leaving every
// one of its angles exactly unchanged.
// =======================

export const TRANSFORM_BASE_TRIANGLE: [Vec3, Vec3, Vec3] = [
  { x: 0, y: 0, z: 0 },
  { x: 1.6, y: 0, z: 0 },
  { x: 0.4, y: 1.1, z: 0 },
];

export const TRANSFORM_HANDLE_REFERENCE_RADIUS = 2;

export function transformTrianglePoint(
  point: Vec3,
  translation: { x: number; y: number },
  rotationRad: number,
  scale: number,
): Vec3 {
  const scaledX = point.x * scale;
  const scaledY = point.y * scale;
  const rotatedX = scaledX * Math.cos(rotationRad) - scaledY * Math.sin(rotationRad);
  const rotatedY = scaledX * Math.sin(rotationRad) + scaledY * Math.cos(rotationRad);
  return { x: rotatedX + translation.x, y: rotatedY + translation.y, z: 0 };
}

function angleAtVertexDeg(prev: Vec3, vertex: Vec3, next: Vec3): number {
  const toPrev = { x: prev.x - vertex.x, y: prev.y - vertex.y };
  const toNext = { x: next.x - vertex.x, y: next.y - vertex.y };
  const dotProduct = toPrev.x * toNext.x + toPrev.y * toNext.y;
  const magnitude = Math.hypot(toPrev.x, toPrev.y) * Math.hypot(toNext.x, toNext.y);
  return Math.acos(Math.max(-1, Math.min(1, dotProduct / magnitude))) * (180 / Math.PI);
}

export function localTransformations(translationPoint: Vec3, handlePoint: Vec3): TransformationsResponse {
  const translation = { x: translationPoint.x, y: translationPoint.y };
  const scale = Math.max(Math.hypot(handlePoint.x, handlePoint.y) / TRANSFORM_HANDLE_REFERENCE_RADIUS, EPSILON);
  const rotationRad = Math.atan2(handlePoint.y, handlePoint.x);

  const [base0, base1, base2] = TRANSFORM_BASE_TRIANGLE;
  const after0 = transformTrianglePoint(base0, translation, rotationRad, scale);
  const after1 = transformTrianglePoint(base1, translation, rotationRad, scale);
  const after2 = transformTrianglePoint(base2, translation, rotationRad, scale);

  return {
    translationX: translation.x,
    translationY: translation.y,
    rotationDeg: rotationRad * (180 / Math.PI),
    scale,
    sampleAngleBeforeDeg: angleAtVertexDeg(base1, base0, base2),
    sampleAngleAfterDeg: angleAtVertexDeg(after1, after0, after2),
  };
}

// =======================
// Foundations — 3D solids. Volume and surface area of the standard
// set every intro curriculum covers: cube, rectangular prism (box),
// cylinder, cone, sphere, and square pyramid. `dimA`/`dimB`/`dimC` are
// generic; each solid interprets only as many of them as it needs.
// =======================

export const SOLID_MIN_DIM = 0.3;
export const SOLID_MAX_DIM = 3;

function clampDim(v: number): number {
  return Math.max(SOLID_MIN_DIM, Math.min(SOLID_MAX_DIM, v));
}

export function localSolid(solidType: SolidType, dimA: number, dimB: number, dimC: number): SolidsResponse {
  const a = clampDim(dimA);
  const b = clampDim(dimB);
  const c = clampDim(dimC);

  switch (solidType) {
    case "cube":
      return { solidType, dimA: a, dimB: 0, dimC: 0, volume: a ** 3, surfaceArea: 6 * a * a, slantHeight: null };
    case "box":
      return {
        solidType,
        dimA: a,
        dimB: b,
        dimC: c,
        volume: a * b * c,
        surfaceArea: 2 * (a * b + a * c + b * c),
        slantHeight: null,
      };
    case "cylinder":
      return {
        solidType,
        dimA: a,
        dimB: b,
        dimC: 0,
        volume: Math.PI * a * a * b,
        surfaceArea: 2 * Math.PI * a * a + 2 * Math.PI * a * b,
        slantHeight: null,
      };
    case "cone": {
      const slantHeight = Math.hypot(a, b);
      return {
        solidType,
        dimA: a,
        dimB: b,
        dimC: 0,
        volume: (Math.PI * a * a * b) / 3,
        surfaceArea: Math.PI * a * a + Math.PI * a * slantHeight,
        slantHeight,
      };
    }
    case "sphere":
      return {
        solidType,
        dimA: a,
        dimB: 0,
        dimC: 0,
        volume: (4 / 3) * Math.PI * a ** 3,
        surfaceArea: 4 * Math.PI * a * a,
        slantHeight: null,
      };
    case "pyramid": {
      const slantHeight = Math.hypot(b, a / 2);
      return {
        solidType,
        dimA: a,
        dimB: b,
        dimC: 0,
        volume: (a * a * b) / 3,
        surfaceArea: a * a + 2 * a * slantHeight,
        slantHeight,
      };
    }
  }
}

// =======================
// Foundations — Cross-sections (the conic sections). A double cone
// with apex at the origin and axis along +z, half-angle α, satisfies
// x² + y² = (z·tanα)². Slicing it with a plane z = m·y + c (tilted by
// β = atan(m) around the x-axis) and substituting gives
// x² + (1 − tan²α·m²)y² − 2tan²α·m·c·y − tan²α·c² = 0 — a conic in x
// and y whose type is set by the sign of its discriminant,
// 4(tan²α·m² − 1): negative is an ellipse (a circle when m = 0),
// zero is a parabola, positive is a hyperbola. That condition reduces
// to comparing the plane's tilt β to the cone's own half-angle α.
// =======================

export const CROSS_SECTION_CONE_HALF_ANGLE = 30;

export function classifyConic(coneHalfAngleDeg: number, planeTiltDeg: number): { conicType: ConicType; discriminant: number } {
  const alpha = coneHalfAngleDeg * (Math.PI / 180);
  const m = Math.tan(planeTiltDeg * (Math.PI / 180));
  const discriminant = 4 * (Math.tan(alpha) * Math.tan(alpha) * m * m - 1);
  const conicType: ConicType =
    Math.abs(discriminant) < 1e-6 ? "parabola" : discriminant < 0 ? (Math.abs(planeTiltDeg) < 1e-6 ? "circle" : "ellipse") : "hyperbola";
  return { conicType, discriminant };
}

export function localCrossSection(coneHalfAngleDeg: number, planeTiltPoint: Vec3, offsetPoint: Vec3): CrossSectionResponse {
  const planeTiltDeg = Math.max(-89, Math.min(89, Math.atan2(planeTiltPoint.y, Math.max(planeTiltPoint.x, EPSILON)) * (180 / Math.PI)));
  const planeOffset = Math.max(0.4, Math.hypot(offsetPoint.x, offsetPoint.y));
  const { conicType, discriminant } = classifyConic(coneHalfAngleDeg, planeTiltDeg);
  return { coneHalfAngleDeg, planeTiltDeg, planeOffset, conicType, discriminant };
}

// Samples the actual intersection curve of the plane z = m·y + c with
// the cone x² + y² = (z·tanα)², by solving the substituted conic for x
// at each sampled y. Returns 3D points (z computed from the same plane
// equation used to derive them), split into one or two branches.
export function crossSectionCurvePoints(
  coneHalfAngleDeg: number,
  planeTiltDeg: number,
  planeOffset: number,
  yRange = 6,
  samples = 400,
): Vec3[][] {
  const alpha = coneHalfAngleDeg * (Math.PI / 180);
  const m = Math.tan(planeTiltDeg * (Math.PI / 180));
  const c = planeOffset;
  const tan2 = Math.tan(alpha) * Math.tan(alpha);
  const bCoef = 1 - tan2 * m * m;
  // A double cone has two nappes (z > 0 and z < 0 both satisfy
  // x²+y²=(z·tanα)²), and a steep-enough plane crosses into both —
  // that's exactly what makes a hyperbola's two lobes disconnected.
  // Truncating to z ≥ 0 would silently delete one lobe. Track +x and
  // -x runs separately, and start a new polyline whenever a run of
  // valid y values ends, so an ellipse comes back as one closed loop
  // per side while a hyperbola comes back as two separate pieces.
  const positiveXRuns: Vec3[][] = [[]];
  const negativeXRuns: Vec3[][] = [[]];
  for (let i = 0; i <= samples; i++) {
    const y = -yRange + (2 * yRange * i) / samples;
    // x^2 = tan2*(m*y+c)^2 - (1 - tan2*m^2)*y^2, from substituting the
    // plane z = m*y+c directly into the cone's x^2+y^2=(z*tanα)^2.
    const rhs = tan2 * (m * y + c) * (m * y + c) - bCoef * y * y;
    if (rhs < 0) {
      if (positiveXRuns.at(-1)!.length > 0) positiveXRuns.push([]);
      if (negativeXRuns.at(-1)!.length > 0) negativeXRuns.push([]);
      continue;
    }
    const x = Math.sqrt(rhs);
    const z = m * y + c;
    positiveXRuns.at(-1)!.push({ x, y, z });
    negativeXRuns.at(-1)!.push({ x: -x, y, z });
  }
  return [...positiveXRuns, ...negativeXRuns].filter((run) => run.length > 1);
}

// =======================
// Foundations — Nets. A cube's cross-shaped net (six squares hinged
// together) folding continuously into the cube. Base face fixed;
// North/South/East/West fold up around their shared edge with the
// base; Top is hinged to North's outer edge, so its transform composes
// North's own fold with its own — the general pattern any net beyond a
// single hinge needs.
// =======================

export const NET_CUBE_SIDE = 1.4;

export function localNet(foldPoint: Vec3): NetResponse {
  const foldFraction = Math.max(0, Math.min(1, foldPoint.x));
  return { side: NET_CUBE_SIDE, foldFraction, isFlat: foldFraction < 1e-6, isFolded: foldFraction > 1 - 1e-6 };
}

type NetFace = { id: string; vertices: [number, number][] };

// Every face's flat-net outline, in the net's own (x, y) plane before
// any folding — a plus/cross shape, base at the center.
export function netCubeFaces(s: number): Record<"base" | "north" | "south" | "east" | "west" | "top", NetFace> {
  const h = s / 2;
  return {
    base: { id: "base", vertices: [[-h, -h], [h, -h], [h, h], [-h, h]] },
    north: { id: "north", vertices: [[-h, h], [h, h], [h, h + s], [-h, h + s]] },
    south: { id: "south", vertices: [[-h, -h], [h, -h], [h, -h - s], [-h, -h - s]] },
    east: { id: "east", vertices: [[h, -h], [h, h], [h + s, h], [h + s, -h]] },
    west: { id: "west", vertices: [[-h, -h], [-h, h], [-h - s, h], [-h - s, -h]] },
    top: { id: "top", vertices: [[-h, h + s], [h, h + s], [h, h + 2 * s], [-h, h + 2 * s]] },
  };
}

function rotateLift(dLocal: number, phi: number): { d: number; z: number } {
  return { d: dLocal * Math.cos(phi), z: dLocal * Math.sin(phi) };
}

// Folds every face of the cube net to 3D at fold fraction t in [0, 1];
// t=0 reproduces the flat net (z=0 everywhere), t=1 is the closed cube.
export function foldCubeNet(s: number, t: number): Record<"base" | "north" | "south" | "east" | "west" | "top", Vec3[]> {
  const h = s / 2;
  const phi = t * (Math.PI / 2);
  const base: Vec3[] = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([x, y]) => ({ x, y, z: 0 }));

  // North/South fold around the x-axis-parallel hinge at y = ±h; the
  // "d" coordinate is the flat distance from that hinge (0..s).
  const foldNS = (yFlat: number, sign: 1 | -1): { y: number; z: number } => {
    const d = sign * (yFlat - sign * h);
    const { d: dFolded, z } = rotateLift(d, phi);
    return { y: sign * h + sign * dFolded, z };
  };
  const north: Vec3[] = [[-h, h], [h, h], [h, h + s], [-h, h + s]].map(([x, y]) => {
    const { y: yF, z } = foldNS(y, 1);
    return { x, y: yF, z };
  });
  const south: Vec3[] = [[-h, -h], [h, -h], [h, -h - s], [-h, -h - s]].map(([x, y]) => {
    const { y: yF, z } = foldNS(y, -1);
    return { x, y: yF, z };
  });

  // East/West fold around the y-axis-parallel hinge at x = ±h.
  const foldEW = (xFlat: number, sign: 1 | -1): { x: number; z: number } => {
    const d = sign * (xFlat - sign * h);
    const { d: dFolded, z } = rotateLift(d, phi);
    return { x: sign * h + sign * dFolded, z };
  };
  const east: Vec3[] = [[h, -h], [h, h], [h + s, h], [h + s, -h]].map(([x, y]) => {
    const { x: xF, z } = foldEW(x, 1);
    return { x: xF, y, z };
  });
  const west: Vec3[] = [[-h, -h], [-h, h], [-h - s, h], [-h - s, -h]].map(([x, y]) => {
    const { x: xF, z } = foldEW(x, -1);
    return { x: xF, y, z };
  });

  // Top is hinged to North's own outer edge (North's d = s). Compose
  // North's rotation (its current d-direction and normal) with Top's
  // own fold fraction around that already-rotated hinge.
  const northOuter = rotateLift(s, phi); // North's outer-edge d,z
  const northHingeY = h + northOuter.d;
  const northHingeZ = northOuter.z;
  const dDir = { y: Math.cos(phi), z: Math.sin(phi) }; // North's own extension direction
  const normalDir = { y: -Math.sin(phi), z: Math.cos(phi) }; // perpendicular, the fold-toward direction
  const top: Vec3[] = [[-h, h + s], [h, h + s], [h, h + 2 * s], [-h, h + 2 * s]].map(([x, yFlat]) => {
    const e = yFlat - (h + s); // distance beyond North's outer edge, 0..s
    const y = northHingeY + e * (Math.cos(phi) * dDir.y + Math.sin(phi) * normalDir.y);
    const z = northHingeZ + e * (Math.cos(phi) * dDir.z + Math.sin(phi) * normalDir.z);
    return { x, y, z };
  });

  return { base, north, south, east, west, top };
}

export function localProjectPointToPlane(input: ProjectPointToPlaneRequest): ProjectPointToPlaneResponse {
  const magnitude = length(input.plane.normal);
  if (magnitude < EPSILON) throw new Error("Plane normal cannot be zero");
  const normal = scale(input.plane.normal, 1 / magnitude);
  const signedDistance = dot(sub(input.point, input.plane.point), normal);
  return {
    projectedPoint: sub(input.point, scale(normal, signedDistance)),
    distance: Math.abs(signedDistance),
  };
}

export function localIntersectRayPlane(input: IntersectRayPlaneRequest): IntersectRayPlaneResponse {
  const denominator = dot(input.ray.dir, input.plane.normal);
  if (Math.abs(denominator) < EPSILON) return { hit: false, point: input.ray.origin, t: 0 };
  const t = dot(sub(input.plane.point, input.ray.origin), input.plane.normal) / denominator;
  if (t < 0) return { hit: false, point: input.ray.origin, t };
  return { hit: true, point: add(input.ray.origin, scale(input.ray.dir, t)), t };
}

export function localClosestPointSegment(input: ClosestPointSegmentRequest): ClosestPointSegmentResponse {
  const ab = sub(input.segment.b, input.segment.a);
  const lengthSquared = dot(ab, ab);
  const t = lengthSquared < EPSILON ? 0 : clamp(dot(sub(input.point, input.segment.a), ab) / lengthSquared);
  const point = add(input.segment.a, scale(ab, t));
  return { point, distance: length(sub(input.point, point)) };
}

export function localSegmentSegment(input: SegmentSegmentRequest): SegmentSegmentResponse {
  const u = sub(input.a2, input.a1);
  const v = sub(input.b2, input.b1);
  const w = sub(input.a1, input.b1);
  const a = dot(u, u);
  const b = dot(u, v);
  const c = dot(v, v);
  const d = dot(u, w);
  const e = dot(v, w);
  const denominator = a * c - b * b;
  let sN = denominator;
  let tN = denominator;
  let sD = denominator;
  let tD = denominator;

  if (a < EPSILON && c < EPSILON) {
    return { pointA: input.a1, pointB: input.b1, distance: length(sub(input.a1, input.b1)) };
  }
  if (a < EPSILON) {
    sN = 0; sD = 1; tN = e; tD = c;
  } else if (c < EPSILON) {
    tN = 0; tD = 1; sN = -d; sD = a;
  } else {
    if (denominator < EPSILON) {
      sN = 0; sD = 1; tN = e; tD = c;
    } else {
      sN = b * e - c * d;
      tN = a * e - b * d;
      if (sN < 0) { sN = 0; tN = e; tD = c; }
      else if (sN > sD) { sN = sD; tN = e + b; tD = c; }
    }
    if (tN < 0) {
      tN = 0;
      sN = clamp(-d / a) * sD;
    } else if (tN > tD) {
      tN = tD;
      sN = clamp((b - d) / a) * sD;
    }
  }

  const s = Math.abs(sN) < EPSILON ? 0 : sN / sD;
  const t = Math.abs(tN) < EPSILON ? 0 : tN / tD;
  const pointA = add(input.a1, scale(u, s));
  const pointB = add(input.b1, scale(v, t));
  return { pointA, pointB, distance: length(sub(pointA, pointB)) };
}

export function localIntersectRayAABB(input: IntersectRayAABBRequest): IntersectRayAABBResponse {
  let tMin = 0;
  let tMax = Number.POSITIVE_INFINITY;
  for (const axis of ["x", "y", "z"] as const) {
    const origin = input.ray.origin[axis];
    const direction = input.ray.dir[axis];
    const min = input.aabb.min[axis];
    const max = input.aabb.max[axis];
    if (Math.abs(direction) < EPSILON) {
      if (origin < min || origin > max) return { hit: false, tMin: 0, tMax: 0, point: input.ray.origin };
      continue;
    }
    let near = (min - origin) / direction;
    let far = (max - origin) / direction;
    if (near > far) [near, far] = [far, near];
    tMin = Math.max(tMin, near);
    tMax = Math.min(tMax, far);
    if (tMin > tMax) return { hit: false, tMin, tMax, point: input.ray.origin };
  }
  return { hit: tMax >= 0, tMin, tMax, point: add(input.ray.origin, scale(input.ray.dir, tMin)) };
}

export function localClosestPointAABB(input: ClosestPointAABBRequest): ClosestPointAABBResponse {
  const point = {
    x: clamp(input.point.x, input.aabb.min.x, input.aabb.max.x),
    y: clamp(input.point.y, input.aabb.min.y, input.aabb.max.y),
    z: clamp(input.point.z, input.aabb.min.z, input.aabb.max.z),
  };
  return { point, distance: length(sub(input.point, point)) };
}

// =======================
// Cartesian transformation (On Growth and Form, Ch. XVII)
//
// A flat rectangle is deformed by dragging its four corners; the same
// bilinear map that warps the grid is applied to a reference outline,
// showing how a regular growth grid can carry one form into another.
// =======================

export const DEFAULT_TRANSFORM_CORNERS: CartesianTransformCorners = {
  p00: { x: -3, y: -1.6, z: 0 },
  p10: { x: 3, y: -1.6, z: 0 },
  p01: { x: -3, y: 1.6, z: 0 },
  p11: { x: 3, y: 1.6, z: 0 },
};

// A simple closed fish silhouette, in (u, v) ∈ [0, 1]² grid coordinates,
// after the manner of D'Arcy Thompson's classic fish-transformation figures.
export const FISH_OUTLINE: Array<[number, number]> = [
  [0.88, 0.52],
  [0.78, 0.66],
  [0.55, 0.72],
  [0.35, 0.64],
  [0.24, 0.54],
  [0.08, 0.68],
  [0.2, 0.5],
  [0.08, 0.32],
  [0.24, 0.46],
  [0.35, 0.36],
  [0.55, 0.28],
  [0.78, 0.34],
];

export const FISH_EYE: [number, number] = [0.8, 0.56];

export function bilinearPoint(u: number, v: number, corners: CartesianTransformCorners): Vec3 {
  const w00 = (1 - u) * (1 - v);
  const w10 = u * (1 - v);
  const w01 = (1 - u) * v;
  const w11 = u * v;
  return {
    x: w00 * corners.p00.x + w10 * corners.p10.x + w01 * corners.p01.x + w11 * corners.p11.x,
    y: w00 * corners.p00.y + w10 * corners.p10.y + w01 * corners.p01.y + w11 * corners.p11.y,
    z: 0,
  };
}

export function polygonArea(polygon: Vec3[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

export function polygonPerimeter(polygon: Vec3[]): number {
  let total = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    total += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return total;
}

function boundingAspect(polygon: Vec3[]): number {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return height < EPSILON ? 0 : width / height;
}

export function localCartesianTransform(corners: CartesianTransformCorners): CartesianTransformResponse {
  const currentPolygon = FISH_OUTLINE.map(([u, v]) => bilinearPoint(u, v, corners));
  const referencePolygon = FISH_OUTLINE.map(([u, v]) => bilinearPoint(u, v, DEFAULT_TRANSFORM_CORNERS));

  const currentArea = polygonArea(currentPolygon);
  const referenceArea = polygonArea(referencePolygon);
  const currentAspect = boundingAspect(currentPolygon);
  const referenceAspect = boundingAspect(referencePolygon);

  return {
    currentArea,
    referenceArea,
    areaRatio: referenceArea < EPSILON ? 0 : currentArea / referenceArea,
    elongation: referenceAspect < EPSILON ? 0 : currentAspect / referenceAspect,
  };
}

// =======================
// Logarithmic (equiangular) spiral growth (On Growth and Form, Ch. XI)
//
// A shell or horn that grows by adding material only at its margin, while
// always keeping the same shape, traces r(θ) = a·e^(bθ) — the defining
// property is that the curve crosses every radius at the same angle.
// =======================

export function logSpiralPoint(theta: number, a: number, b: number): Vec3 {
  const r = a * Math.exp(b * theta);
  return { x: r * Math.cos(theta), y: r * Math.sin(theta), z: 0 };
}

export function localLogSpiral(input: { start: Vec3; turn: Vec3 }): LogSpiralResponse {
  const a = Math.max(Math.hypot(input.start.x, input.start.y), EPSILON);
  const rTurn = Math.max(Math.hypot(input.turn.x, input.turn.y), EPSILON);
  const growthRatio = rTurn / a;
  const b = Math.log(growthRatio) / (2 * Math.PI);
  const pitchAngleDeg = Math.acos(Math.abs(b) / Math.sqrt(1 + b * b)) * (180 / Math.PI);
  return { a, b, growthRatio, pitchAngleDeg };
}

// =======================
// Soap-bubble / cell packing (On Growth and Form, Ch. VI–VII)
//
// Plateau's laws: films meet at 120°, and cells that grow from separate
// centers until they touch partition space exactly along the perpendicular
// bisectors between centers — a Voronoi diagram. A regular hexagonal
// arrangement of centers is the equilibrium Thompson describes; moving one
// center degrades its cell away from that ideal.
// =======================

export const CELL_RING_SITES: Vec3[] = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI / 3) * i;
  const radius = 2.2;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0 };
});

const CELL_BOUNDS = { minX: -5, maxX: 5, minY: -5, maxY: 5 };

function clipPolygonHalfPlane(polygon: Vec3[], normal: { x: number; y: number }, c: number): Vec3[] {
  const result: Vec3[] = [];
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];
    const currInside = curr.x * normal.x + curr.y * normal.y <= c;
    const nextInside = next.x * normal.x + next.y * normal.y <= c;
    if (currInside) result.push(curr);
    if (currInside !== nextInside) {
      const d = { x: next.x - curr.x, y: next.y - curr.y };
      const denom = d.x * normal.x + d.y * normal.y;
      const t = Math.abs(denom) < EPSILON ? 0 : (c - (curr.x * normal.x + curr.y * normal.y)) / denom;
      result.push({ x: curr.x + t * d.x, y: curr.y + t * d.y, z: 0 });
    }
  }
  return result;
}

// The Voronoi cell of `site`: the region closer to it than to any site in
// `others`, found by intersecting the perpendicular-bisector half-planes,
// clipped to a bounding box so the diagram stays finite.
export function voronoiCell(site: Vec3, others: Vec3[]): Vec3[] {
  let polygon: Vec3[] = [
    { x: CELL_BOUNDS.minX, y: CELL_BOUNDS.minY, z: 0 },
    { x: CELL_BOUNDS.maxX, y: CELL_BOUNDS.minY, z: 0 },
    { x: CELL_BOUNDS.maxX, y: CELL_BOUNDS.maxY, z: 0 },
    { x: CELL_BOUNDS.minX, y: CELL_BOUNDS.maxY, z: 0 },
  ];
  for (const other of others) {
    const normal = { x: other.x - site.x, y: other.y - site.y };
    const c = (other.x * other.x + other.y * other.y - (site.x * site.x + site.y * site.y)) / 2;
    polygon = clipPolygonHalfPlane(polygon, normal, c);
    if (polygon.length === 0) break;
  }
  return polygon;
}

function countPolygonSides(polygon: Vec3[]): number {
  const deduped: Vec3[] = [];
  for (const p of polygon) {
    const last = deduped[deduped.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 1e-6) deduped.push(p);
  }
  if (deduped.length > 1) {
    const first = deduped[0];
    const last = deduped[deduped.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) deduped.pop();
  }
  const n = deduped.length;
  if (n < 3) return n;
  let sides = 0;
  for (let i = 0; i < n; i++) {
    const prev = deduped[(i - 1 + n) % n];
    const curr = deduped[i];
    const next = deduped[(i + 1) % n];
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const cross = v1.x * v2.y - v1.y * v2.x;
    const dot = v1.x * v2.x + v1.y * v2.y;
    if (Math.atan2(Math.abs(cross), dot) > 1e-3) sides++;
  }
  return sides;
}

// =======================
// Helical (turreted) shell growth (On Growth and Form, Ch. XI)
//
// A flat equiangular spiral has zero rise per turn. Most real snail shells
// also translate along an axis as they wind, tracing a 3D curve that both
// widens (radius growth, exactly as before) and climbs (a constant rise
// per turn) at once — the "turreted" shell shape, as opposed to the
// nearly-flat cross-section of a nautilus.
// =======================

export function helicalShellPoint(theta: number, a: number, b: number, c: number): Vec3 {
  const r = a * Math.exp(b * theta);
  return { x: r * Math.cos(theta), y: r * Math.sin(theta), z: c * theta };
}

export function localHelicalShell(input: { start: Vec3; turn: Vec3 }): HelicalShellResponse {
  const a = Math.max(Math.hypot(input.start.x, input.start.y), EPSILON);
  const rTurn = Math.max(Math.hypot(input.turn.x, input.turn.y), EPSILON);
  const growthRatio = rTurn / a;
  const b = Math.log(growthRatio) / (2 * Math.PI);
  // T is "the point after one full turn" for its radius, so its z is
  // likewise the rise after one turn — z(θ) = cθ needs c per radian.
  const risePerTurn = input.turn.z;
  const c = risePerTurn / (2 * Math.PI);
  const pitchAngleDeg = Math.acos(Math.abs(b) / Math.sqrt(1 + b * b)) * (180 / Math.PI);
  return { a, b, c, growthRatio, risePerTurn, pitchAngleDeg };
}

export function localCellPacking(center: Vec3): CellPackingResponse {
  const cell = voronoiCell(center, CELL_RING_SITES);
  const area = polygonArea(cell);
  const perimeter = polygonPerimeter(cell);
  return {
    area,
    perimeter,
    isoperimetricQuotient: perimeter < EPSILON ? 0 : (4 * Math.PI * area) / (perimeter * perimeter),
    sides: countPolygonSides(cell),
  };
}

// =======================
// The square-cube law (On Growth and Form, Ch. II, "On Magnitude")
//
// Uniformly scaling a shape by a factor L grows its surface area by L² but
// its volume by L³, so surface-to-volume falls as 1/L — the reason a
// larger animal cannot simply be a scaled-up copy of a smaller one.
// =======================

export function localSquareCubeLaw(point: Vec3): MagnitudeScalingResponse {
  const radius = Math.max(Math.hypot(point.x, point.y, point.z), EPSILON);
  const surfaceArea = 4 * Math.PI * radius * radius;
  const volume = (4 / 3) * Math.PI * radius * radius * radius;
  return { radius, surfaceArea, volume, ratio: surfaceArea / volume };
}

// =======================
// The catenary arch — the exact equilibrium shape of a chain hanging
// under its own weight (and, inverted, the ideal pure-compression arch),
// y = a·(cosh(x/a) − 1) with its lowest point at the origin.
// =======================

export const CATENARY_HALF_SPAN = 3;

export function catenaryPoint(x: number, a: number): Vec3 {
  return { x, y: a * (Math.cosh(x / a) - 1), z: 0 };
}

export function localCatenary(aPoint: Vec3, halfSpan: number): CatenaryResponse {
  const a = Math.max(Math.hypot(aPoint.x, aPoint.y), EPSILON);
  const sag = a * (Math.cosh(halfSpan / a) - 1);
  const arcLength = 2 * a * Math.sinh(halfSpan / a);
  return { a, sag, arcLength };
}

// =======================
// Allometric growth (On Growth and Form, Ch. IV, "On the Rate of Growth")
//
// Huxley and Thompson's allometric equation y = b·x^k relates the size of
// a part (y) to the size of the whole (x) as an organism grows. k = 1 is
// isometric (constant shape at every size); k ≠ 1 means the part's share
// of the whole changes with size — the source of most shape change in
// growth and evolution alike.
// =======================

export function localAllometricGrowth(sizePoint: Vec3, exponentPoint: Vec3): AllometricGrowthResponse {
  const x = Math.max(Math.hypot(sizePoint.x, sizePoint.y), EPSILON);
  const k = Math.max(Math.hypot(exponentPoint.x, exponentPoint.y), EPSILON);
  const y = Math.pow(x, k);
  return { x, k, y, ratio: y / x };
}

// =======================
// Phyllotaxis — Vogel's model of a sunflower head. Seed i sits at angle
// i·δ and radius c·√i; only the golden angle δ = π(3−√5) packs every
// seed against its neighbors with no gaps and no overlapping spiral
// arms, because it is the real number worst approximated by fractions.
// =======================

export const GOLDEN_ANGLE_RAD = Math.PI * (3 - Math.sqrt(5));
export const PHYLLOTAXIS_SEED_COUNT = 250;
export const PHYLLOTAXIS_SCALE = 0.14;
export const PHYLLOTAXIS_DIAL_RADIUS = 3.2;

export function phyllotaxisPoint(index: number, divergenceRad: number, scale: number): Vec3 {
  const theta = index * divergenceRad;
  const r = scale * Math.sqrt(index);
  return { x: r * Math.cos(theta), y: r * Math.sin(theta), z: 0 };
}

export function localPhyllotaxis(divergencePoint: Vec3): PhyllotaxisResponse {
  const rawAngle = Math.atan2(divergencePoint.y, divergencePoint.x);
  const divergenceRad = rawAngle < 0 ? rawAngle + 2 * Math.PI : rawAngle;
  const divergenceDeg = divergenceRad * (180 / Math.PI);
  const goldenAngleDeg = GOLDEN_ANGLE_RAD * (180 / Math.PI);
  return {
    divergenceDeg,
    goldenAngleDeg,
    deviationDeg: Math.abs(divergenceDeg - goldenAngleDeg),
  };
}

// =======================
// The logistic growth curve (On Growth and Form, Ch. III–IV): growth as
// a function of TIME rather than of another part. N(t) = K / (1 + e^(r(c−t)))
// is centered so its inflection always falls at t = c, where N = K/2 and
// the growth rate itself is at its maximum, exactly rK/4.
// =======================

export const LOGISTIC_TIME_CENTER = 6;
export const LOGISTIC_TIME_SPAN = 12;

export function logisticPoint(t: number, r: number, k: number): Vec3 {
  const n = k / (1 + Math.exp(r * (LOGISTIC_TIME_CENTER - t)));
  return { x: t, y: n, z: 0 };
}

export function localLogisticGrowth(rPoint: Vec3, kPoint: Vec3): LogisticGrowthResponse {
  const r = Math.max(Math.hypot(rPoint.x, rPoint.y), EPSILON);
  const k = Math.max(kPoint.y, EPSILON);
  return {
    r,
    k,
    inflectionTime: LOGISTIC_TIME_CENTER,
    maxGrowthRate: (r * k) / 4,
  };
}

// =======================
// The geodesic sphere (On Growth and Form's note on geodesics, and the
// lattice skeletons of Radiolaria such as Aulonia hexagona). Subdividing
// an icosahedron to frequency f (three.js's "detail" + 1: each edge is
// split into f segments) always gives V = 10f²+2, E = 30f², F = 20f² —
// and therefore V − E + F = 2, Euler's formula, regardless of how fine
// the lattice is.
// =======================

export function localGeodesicSphere(rawDetail: number): GeodesicSphereResponse {
  const detail = Math.max(0, Math.min(6, Math.round(rawDetail)));
  const f = detail + 1;
  const vertices = 10 * f * f + 2;
  const edges = 30 * f * f;
  const faces = 20 * f * f;
  return { detail, vertices, edges, faces, eulerCharacteristic: vertices - edges + faces };
}

// =======================
// The golden rectangle / whirling squares construction — the discrete
// geometric origin of the equiangular spiral. Removing the largest
// square from a golden rectangle always leaves a smaller golden
// rectangle, rotated a quarter turn, so consecutive squares' sides
// shrink by exactly φ every step.
// =======================

export const PHI = (1 + Math.sqrt(5)) / 2;

export type WhirlingSquare = { x0: number; y0: number; x1: number; y1: number; direction: "left" | "bottom" | "right" | "top" };

export function buildWhirlingSquares(count: number): WhirlingSquare[] {
  const directions: WhirlingSquare["direction"][] = ["left", "bottom", "right", "top"];
  let x0 = 0, y0 = 0, x1 = PHI, y1 = 1;
  const squares: WhirlingSquare[] = [];
  for (let i = 0; i < count; i++) {
    const width = x1 - x0;
    const height = y1 - y0;
    const side = Math.min(width, height);
    const direction = directions[i % 4];
    let square: WhirlingSquare;
    if (direction === "left") {
      square = { x0, y0, x1: x0 + side, y1, direction };
      x0 += side;
    } else if (direction === "bottom") {
      square = { x0, y0, x1, y1: y0 + side, direction };
      y0 += side;
    } else if (direction === "right") {
      square = { x0: x1 - side, y0, x1, y1, direction };
      x1 -= side;
    } else {
      square = { x0, y0: y1 - side, x1, y1, direction };
      y1 -= side;
    }
    squares.push(square);
  }
  return squares;
}

export function localWhirlingSquares(countPoint: Vec3): WhirlingSquaresResponse {
  const count = Math.max(1, Math.min(14, Math.round(Math.max(Math.hypot(countPoint.x, countPoint.y), 1))));
  // side_i = 1/φ^i (i = 0..count-1); each quarter-circle arc has length (π/2)·side_i.
  let totalArcLength = 0;
  for (let i = 0; i < count; i++) {
    totalArcLength += (Math.PI / 2) * PHI ** -i;
  }
  return { count, ratio: PHI, totalArcLength };
}

// =======================
// The catenoid — the actual soap film that spans two coaxial rings,
// the surface swept by revolving the catenary r(z) = a·cosh(z/a) around
// its axis. Its area between z = ±h has the closed form
// 2πa²·(H + sinh(2H)/2), where H = h/a.
// =======================

export const CATENOID_HALF_HEIGHT = 2;

export function catenoidRadius(z: number, a: number): number {
  return a * Math.cosh(z / a);
}

export function localCatenoid(aPoint: Vec3): CatenoidResponse {
  const a = Math.max(Math.hypot(aPoint.x, aPoint.y), EPSILON);
  const h = CATENOID_HALF_HEIGHT;
  const rimRadius = catenoidRadius(h, a);
  const bigH = h / a;
  const surfaceArea = 2 * Math.PI * a * a * (bigH + Math.sinh(2 * bigH) / 2);
  return { a, rimRadius, surfaceArea };
}

// =======================
// The milk-drop coronet — Worthington and Edgerton's splash-crown
// photography. The crown breaks into N roughly equal points around its
// rim; treating those points as vertices of a regular N-gon inscribed in
// the rim circle of radius R, the polygon's perimeter 2NR·sin(π/N) falls
// short of the smooth circumference 2πR by an amount that shrinks like
// 1/N² as N grows — Archimedes' method of exhausting a circle by
// polygons, the same convergence nature exploits when the splash settles
// on a particular number of jets.
// =======================

export const MILK_CORONET_MIN_POINTS = 3;
export const MILK_CORONET_MAX_POINTS = 40;
export const MILK_CORONET_SPIKE_HEIGHT = 1.05;
export const MILK_CORONET_CRATER_DEPTH = 0.55;

export function milkCoronetSpikeAngle(index: number, points: number): number {
  return (2 * Math.PI * index) / points;
}

export function localMilkCoronet(radiusPoint: Vec3, countPoint: Vec3): MilkCoronetResponse {
  const radius = Math.max(Math.hypot(radiusPoint.x, radiusPoint.y), EPSILON);
  const rawCount = Math.max(Math.hypot(countPoint.x, countPoint.y), MILK_CORONET_MIN_POINTS);
  const points = Math.max(MILK_CORONET_MIN_POINTS, Math.min(MILK_CORONET_MAX_POINTS, Math.round(rawCount)));
  const circumference = 2 * Math.PI * radius;
  const chordLength = 2 * radius * Math.sin(Math.PI / points);
  const polygonPerimeter = points * chordLength;
  return {
    radius,
    points,
    circumference,
    polygonPerimeter,
    circleDeficit: circumference - polygonPerimeter,
  };
}

// =======================
// The egg — built from Thompson's own way of comparing ovoid curves: two
// circles of different radii (a "round end" and a "pointed end"), joined
// smoothly by their common external tangent lines, exactly the classic
// compass-and-straightedge method for drafting an egg-shaped oval.
// Revolving the profile around the axis joining the two centers turns
// each circular arc into a genuine spherical zone (Archimedes' hat-box
// theorem: a zone's area is 2π·radius·(its own axial height), regardless
// of where on the sphere it sits) and the tangent line into a cone
// frustum, giving an exact closed form for the egg's surface area.
// =======================

export const EGG_CENTER_DISTANCE = 2.2;
export const EGG_MIN_RADIUS = 0.4;
export const EGG_MAX_RADIUS = 1.6;

function clampEggRadius(value: number): number {
  return Math.max(EGG_MIN_RADIUS, Math.min(EGG_MAX_RADIUS, value));
}

export function localEggCurve(bigPoint: Vec3, smallPoint: Vec3): EggCurveResponse {
  const bigRadius = clampEggRadius(Math.max(Math.hypot(bigPoint.x, bigPoint.y), EPSILON));
  const smallRadius = clampEggRadius(Math.max(Math.hypot(smallPoint.x, smallPoint.y), EPSILON));
  const d = EGG_CENTER_DISTANCE;
  const alpha = Math.asin((bigRadius - smallRadius) / d);
  const tangentLength = Math.sqrt(d * d - (bigRadius - smallRadius) * (bigRadius - smallRadius));
  // The two tangent points sit at ±(π/2 + α) on EACH circle (parallel
  // radii, the defining property of an external tangent). That splits
  // each circle into a "near" arc (facing the other circle, cut away)
  // and a "far" arc (kept, part of the outline) — but the far arc's
  // angular width is NOT the same on both circles: it's (π − 2α) on the
  // small circle (whose near arc, facing outward toward the bigger
  // circle, is the wider one) and (π + 2α) on the big circle. The two
  // widths sum to exactly 2π, one full circle's worth, only coinciding
  // at π apiece when the radii are equal.
  const smallArcAngle = Math.PI - 2 * alpha;
  const bigArcAngle = Math.PI + 2 * alpha;
  const perimeter = smallArcAngle * smallRadius + bigArcAngle * bigRadius + 2 * tangentLength;
  // The surface area, unlike the perimeter, comes from each arc's AXIAL
  // span (Archimedes' hat-box theorem: a spherical zone's area is
  // 2π·radius·(its own height), independent of angular position), so it
  // doesn't share the perimeter's angular bookkeeping.
  const surfaceArea =
    2 * Math.PI * bigRadius * bigRadius * (1 + Math.sin(alpha)) +
    2 * Math.PI * smallRadius * smallRadius * (1 - Math.sin(alpha)) +
    Math.PI * (bigRadius + smallRadius) * d * Math.cos(alpha) * Math.cos(alpha);
  return {
    bigRadius,
    smallRadius,
    tangentLength,
    tiltAngleDeg: alpha * (180 / Math.PI),
    perimeter,
    surfaceArea,
  };
}

// The half-profile (radial distance from the axis, position along the
// axis) that LatheGeometry revolves into the 3D egg: tip of the small
// circle's far arc, the tangent line, then the big circle's far arc to
// its tip. Shared by the scene (rendering) and the tests (independent
// numerical cross-check of the closed-form perimeter and surface area).
export function eggProfilePoints(bigRadius: number, smallRadius: number, samplesPerArc = 24): Array<[number, number]> {
  const d = EGG_CENTER_DISTANCE;
  const alpha = Math.asin((bigRadius - smallRadius) / d);
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= samplesPerArc; i++) {
    const theta = Math.PI - (i / samplesPerArc) * (Math.PI / 2 - alpha);
    points.push([smallRadius * Math.sin(theta), smallRadius * Math.cos(theta)]);
  }
  const tSmall = points[points.length - 1];
  const bigTangentAxial = d - bigRadius * Math.sin(alpha);
  const bigTangentRadial = bigRadius * Math.cos(alpha);
  const tangentSamples = 8;
  for (let i = 1; i <= tangentSamples; i++) {
    const t = i / tangentSamples;
    points.push([
      tSmall[0] + t * (bigTangentRadial - tSmall[0]),
      tSmall[1] + t * (bigTangentAxial - tSmall[1]),
    ]);
  }
  for (let i = 1; i <= samplesPerArc; i++) {
    const theta = (Math.PI / 2 + alpha) * (1 - i / samplesPerArc);
    points.push([bigRadius * Math.sin(theta), d + bigRadius * Math.cos(theta)]);
  }
  return points;
}

// =======================
// The helicoid — the twisted-ribbon minimal surface a soap film forms on
// a helical wire frame: (u, v) ↦ (u·cos v, u·sin v, c·v). It is the
// geometric sibling of the catenoid (the two are a classic "Bonnet
// pair"): where the catenoid is the film on two rings, the helicoid is
// the film on a screw thread. Its surface-element is √(u² + c²), so the
// area swept over a radius R and a total sweep angle V has the closed
// form V·[(R/2)√(R²+c²) + (c²/2)·ln((R+√(R²+c²))/c)].
// =======================

export const HELICOID_TURNS = 2.5;

export function helicoidPoint(u: number, v: number, c: number): Vec3 {
  return { x: u * Math.cos(v), y: u * Math.sin(v), z: c * v };
}

export function localHelicoid(radiusPoint: Vec3, pitchPoint: Vec3): HelicoidResponse {
  const radius = Math.max(Math.hypot(radiusPoint.x, radiusPoint.y), EPSILON);
  const risePerTurn = Math.max(Math.abs(pitchPoint.z), EPSILON);
  const c = risePerTurn / (2 * Math.PI);
  const totalAngle = HELICOID_TURNS * 2 * Math.PI;
  const s = Math.sqrt(radius * radius + c * c);
  const area = totalAngle * ((radius / 2) * s + (c * c / 2) * Math.log((radius + s) / c));
  return { radius, c, risePerTurn, area };
}

// =======================
// The bee's cell (Réaumur, Maraldi, König, and Maclaurin's problem,
// which Thompson revisits in his account of the honeycomb). A hexagonal
// prism cell, side length 1, is closed not by a flat lid but by 3
// congruent rhombi meeting at a point: three alternating top corners
// ("kept", A) stay put while the other three ("trimmed", B) are pushed
// down by a rise x, and a shared apex rises by the same x directly
// above the hexagon's center. Each closing face — kept corner, trimmed
// corner, next kept corner, apex — is planar and a genuine rhombus for
// EVERY x (its short diagonal is the hexagon's fixed second-neighbor
// span, √3; its long diagonal, from the trimmed corner to the apex,
// grows with x), so trimming trades rhombus area against shortened
// prism walls. The trade has a real minimum, first solved by Maclaurin
// with calculus: the wax-minimizing rise is x = 1/(2√2), where each
// ridge (apex to a kept corner) makes an angle of exactly arccos(1/3)
// ≈ 70.53° with the prism's axis.
// =======================

export const BEE_CELL_HEXAGON_SIDE = 1;
export const BEE_CELL_WALL_HEIGHT = 2;
export const BEE_CELL_MIN_RISE = 0.05;
export const BEE_CELL_MAX_RISE = 1.1;
export const BEE_CELL_OPTIMAL_RISE = 1 / (2 * Math.sqrt(2));

// Rim vertex `index` (0..5, 60° apart): even indices are "kept" (A-type,
// z = 0), odd indices are "trimmed" (B-type, pushed down to z = -x).
export function beeCellRimVertex(index: number, x: number): Vec3 {
  const angle = (Math.PI / 3) * index;
  const isKept = index % 2 === 0;
  return {
    x: BEE_CELL_HEXAGON_SIDE * Math.cos(angle),
    y: BEE_CELL_HEXAGON_SIDE * Math.sin(angle),
    z: isKept ? 0 : -x,
  };
}

export function beeCellApex(x: number): Vec3 {
  return { x: 0, y: 0, z: x };
}

export function beeCellRhombusArea(x: number): number {
  // diagonal 1: between the two kept corners flanking one trimmed
  // corner — the hexagon's fixed second-neighbor distance, √3.
  // diagonal 2: trimmed corner to apex, √(1 + 4x²).
  return (Math.sqrt(3) / 2) * Math.sqrt(1 + 4 * x * x);
}

export function localBeeCell(risePoint: Vec3): BeeCellResponse {
  const x = Math.max(BEE_CELL_MIN_RISE, Math.min(BEE_CELL_MAX_RISE, Math.hypot(risePoint.x, risePoint.y)));
  const rhombusArea = beeCellRhombusArea(x);
  const ridgeAngleDeg = Math.acos(x / Math.sqrt(1 + x * x)) * (180 / Math.PI);
  const wallHeight = BEE_CELL_WALL_HEIGHT;
  // 3 full-height "kept" walls + 3 shortened "trimmed" walls + 3 rhombi.
  const totalSurfaceArea = 3 * wallHeight + 3 * (wallHeight - x) + 3 * rhombusArea;
  const optimalX = BEE_CELL_OPTIMAL_RISE;
  const optimalRidgeAngleDeg = Math.acos(optimalX / Math.sqrt(1 + optimalX * optimalX)) * (180 / Math.PI);
  return { x, ridgeAngleDeg, rhombusArea, totalSurfaceArea, optimalX, optimalRidgeAngleDeg };
}
