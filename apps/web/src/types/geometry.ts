export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type Plane = {
  point: Vec3;
  normal: Vec3;
};

export type ProjectPointToPlaneRequest = {
  point: Vec3;
  plane: Plane;
};

export type ProjectPointToPlaneResponse = {
  projectedPoint: Vec3;
  distance: number;
};
export type Ray = {
  origin: Vec3;
  dir: Vec3;
};

export type IntersectRayPlaneRequest = {
  ray: Ray;
  plane: Plane;
};

export type IntersectRayPlaneResponse = {
  hit: boolean;
  point: Vec3;
  t: number;
};
