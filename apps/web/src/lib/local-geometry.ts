import type {
  CartesianTransformCorners,
  CartesianTransformResponse,
  ClosestPointAABBRequest,
  ClosestPointAABBResponse,
  ClosestPointSegmentRequest,
  ClosestPointSegmentResponse,
  IntersectRayAABBRequest,
  IntersectRayAABBResponse,
  IntersectRayPlaneRequest,
  IntersectRayPlaneResponse,
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

function shoelaceArea(polygon: Vec3[]): number {
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
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

  const currentArea = shoelaceArea(currentPolygon);
  const referenceArea = shoelaceArea(referencePolygon);
  const currentAspect = boundingAspect(currentPolygon);
  const referenceAspect = boundingAspect(referencePolygon);

  return {
    currentArea,
    referenceArea,
    areaRatio: referenceArea < EPSILON ? 0 : currentArea / referenceArea,
    elongation: referenceAspect < EPSILON ? 0 : currentAspect / referenceAspect,
  };
}
