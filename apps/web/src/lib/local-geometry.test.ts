import test from "node:test";
import assert from "node:assert/strict";
import {
  localClosestPointAABB,
  localClosestPointSegment,
  localIntersectRayAABB,
  localIntersectRayPlane,
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
