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
