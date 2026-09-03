import type {
  CartesianTransformCorners,
  CartesianTransformResponse,
  CellPackingResponse,
  ClosestPointAABBRequest,
  ClosestPointAABBResponse,
  ClosestPointSegmentRequest,
  ClosestPointSegmentResponse,
  IntersectRayAABBRequest,
  IntersectRayAABBResponse,
  HelicalShellResponse,
  IntersectRayPlaneRequest,
  IntersectRayPlaneResponse,
  LogSpiralResponse,
  ProjectPointToPlaneRequest,
  ProjectPointToPlaneResponse,
  SegmentSegmentRequest,
  SegmentSegmentResponse,
  Vec3,
} from "@/types/geometry";

const EPSILON = 1e-9;
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (v: Vec3, amount: number): Vec3 => ({ x: v.x * amount, y: v.y * amount, z: v.z * amount });
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const length = (v: Vec3) => Math.hypot(v.x, v.y, v.z);
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

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
