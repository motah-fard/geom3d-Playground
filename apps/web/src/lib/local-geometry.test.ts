import test from "node:test";
import assert from "node:assert/strict";
import {
  CELL_RING_SITES,
  DEFAULT_TRANSFORM_CORNERS,
  bilinearPoint,
  localCartesianTransform,
  localCellPacking,
  localClosestPointAABB,
  localClosestPointSegment,
  localIntersectRayAABB,
  localIntersectRayPlane,
  localLogSpiral,
  localProjectPointToPlane,
  localSegmentSegment,
} from "./local-geometry.ts";

test("projects a point onto a plane", () => {
  const result = localProjectPointToPlane({ point: { x: 1, y: 2, z: 3 }, plane: { point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 1 } } });
  assert.deepEqual(result, { projectedPoint: { x: 1, y: 2, z: 0 }, distance: 3 });
});

test("intersects a ray with a plane and detects a parallel miss", () => {
  const plane = { point: { x: 0, y: 0, z: 0 }, normal: { x: 0, y: 0, z: 1 } };
  assert.equal(localIntersectRayPlane({ ray: { origin: { x: 0, y: 0, z: 5 }, dir: { x: 0, y: 0, z: -1 } }, plane }).t, 5);
  assert.equal(localIntersectRayPlane({ ray: { origin: { x: 0, y: 0, z: 5 }, dir: { x: 1, y: 0, z: 0 } }, plane }).hit, false);
});

test("finds the closest point on regular and collapsed segments", () => {
  assert.deepEqual(localClosestPointSegment({ point: { x: 1, y: 2, z: 0 }, segment: { a: { x: 0, y: 0, z: 0 }, b: { x: 3, y: 0, z: 0 } } }), { point: { x: 1, y: 0, z: 0 }, distance: 2 });
  assert.equal(localClosestPointSegment({ point: { x: 0, y: 3, z: 4 }, segment: { a: { x: 0, y: 0, z: 0 }, b: { x: 0, y: 0, z: 0 } } }).distance, 5);
});

test("measures intersecting and skew segments", () => {
  assert.equal(localSegmentSegment({ a1: { x: -2, y: 0, z: 0 }, a2: { x: 2, y: 0, z: 0 }, b1: { x: 0, y: -2, z: 0 }, b2: { x: 0, y: 2, z: 0 } }).distance, 0);
  assert.equal(localSegmentSegment({ a1: { x: -2, y: 0, z: 0 }, a2: { x: 2, y: 0, z: 0 }, b1: { x: 0, y: -2, z: 2 }, b2: { x: 0, y: 2, z: 2 } }).distance, 2);
});

test("intersects a ray with an AABB and detects a miss", () => {
  const aabb = { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } };
  const hit = localIntersectRayAABB({ ray: { origin: { x: -4, y: 1, z: 1 }, dir: { x: 1, y: 0, z: 0 } }, aabb });
  assert.equal(hit.tMin, 4);
  assert.deepEqual(hit.point, { x: 0, y: 1, z: 1 });
  assert.equal(localIntersectRayAABB({ ray: { origin: { x: -4, y: 4, z: 1 }, dir: { x: 1, y: 0, z: 0 } }, aabb }).hit, false);
});

test("clamps a point to an AABB", () => {
  const result = localClosestPointAABB({ point: { x: 4, y: 3, z: 3 }, aabb: { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } } });
  assert.deepEqual(result.point, { x: 2, y: 2, z: 2 });
  assert.equal(result.distance, Math.sqrt(6));
});

test("bilinear map reduces to its corners and center average", () => {
  const corners = DEFAULT_TRANSFORM_CORNERS;
  assert.deepEqual(bilinearPoint(0, 0, corners), corners.p00);
  assert.deepEqual(bilinearPoint(1, 0, corners), corners.p10);
  assert.deepEqual(bilinearPoint(0, 1, corners), corners.p01);
  assert.deepEqual(bilinearPoint(1, 1, corners), corners.p11);
  assert.deepEqual(bilinearPoint(0.5, 0.5, corners), {
    x: (corners.p00.x + corners.p10.x + corners.p01.x + corners.p11.x) / 4,
    y: (corners.p00.y + corners.p10.y + corners.p01.y + corners.p11.y) / 4,
    z: 0,
  });
});

test("Cartesian transform is identity at the default corners and scales area with a stretch", () => {
  const identity = localCartesianTransform(DEFAULT_TRANSFORM_CORNERS);
  assert.equal(identity.areaRatio, 1);
  assert.equal(identity.elongation, 1);

  const stretchedX = {
    p00: { x: -6, y: -1.6, z: 0 },
    p10: { x: 6, y: -1.6, z: 0 },
    p01: { x: -6, y: 1.6, z: 0 },
    p11: { x: 6, y: 1.6, z: 0 },
  };
  const stretched = localCartesianTransform(stretchedX);
  assert.ok(Math.abs(stretched.areaRatio - 2) < 1e-9);
  assert.ok(Math.abs(stretched.elongation - 2) < 1e-9);
});

test("a logarithmic spiral with equal start and turn radii is a circle (b = 0, pitch = 90°)", () => {
  const result = localLogSpiral({ start: { x: 1, y: 0, z: 0 }, turn: { x: 1, y: 0, z: 0 } });
  assert.equal(result.growthRatio, 1);
  assert.equal(result.b, 0);
  assert.ok(Math.abs(result.pitchAngleDeg - 90) < 1e-9);
});

test("a logarithmic spiral recovers its growth rate constant from the two control points", () => {
  const b = 0.1;
  const rTurn = Math.exp(2 * Math.PI * b);
  const result = localLogSpiral({ start: { x: 1, y: 0, z: 0 }, turn: { x: rTurn, y: 0, z: 0 } });
  assert.ok(Math.abs(result.b - b) < 1e-9);
  assert.ok(result.pitchAngleDeg > 0 && result.pitchAngleDeg < 90);
});

test("a centered cell in a regular hexagonal ring is a regular hexagon", () => {
  const result = localCellPacking({ x: 0, y: 0, z: 0 });
  assert.equal(result.sides, 6);
  // 4*pi*area / perimeter^2 for a regular hexagon is pi*sqrt(3)/6 ≈ 0.9069.
  assert.ok(Math.abs(result.isoperimetricQuotient - (Math.PI * Math.sqrt(3)) / 6) < 1e-9);
});

test("an off-center cell is less regular than the centered one", () => {
  const centered = localCellPacking({ x: 0, y: 0, z: 0 });
  const offCenter = localCellPacking({ x: 1, y: 0, z: 0 });
  assert.ok(offCenter.isoperimetricQuotient < centered.isoperimetricQuotient);
  // still fully enclosed by its six neighbors
  assert.ok(offCenter.sides >= 3);
  assert.ok(CELL_RING_SITES.length === 6);
});
