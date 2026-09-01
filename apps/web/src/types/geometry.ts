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

// The full set of query types the playground supports. Kept here (rather
// than inline in the store) so it can be imported anywhere a properly
// typed QueryType is needed instead of casting through `any`.
export type QueryType =
  | "project-point-to-plane"
  | "intersect-ray-plane"
  | "closest-point-segment"
  | "segment-segment"
  | "intersect-ray-aabb"
  | "closest-point-aabb";
