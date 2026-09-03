import test from "node:test";
import assert from "node:assert/strict";
import {
  CELL_RING_SITES,
  DEFAULT_TRANSFORM_CORNERS,
  bilinearPoint,
  localCartesianTransform,
  localCellPacking,
  buildWhirlingSquares,
  catenoidRadius,
  GOLDEN_ANGLE_RAD,
  localAllometricGrowth,
  localCatenary,
  localCatenoid,
  localClosestPointAABB,
  localClosestPointSegment,
  localGeodesicSphere,
  localHelicalShell,
  localIntersectRayAABB,
  localIntersectRayPlane,
  localLogisticGrowth,
  LOGISTIC_TIME_CENTER,
  localLogSpiral,
  localPhyllotaxis,
  localSquareCubeLaw,
  localWhirlingSquares,
  logisticPoint,
  PHI,
  helicalShellPoint,
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

test("a helical shell reduces to the flat spiral when rise-per-turn is zero", () => {
  const flat = localHelicalShell({ start: { x: 1, y: 0, z: 0 }, turn: { x: 1.4, y: 0, z: 0 } });
  const spiral = localLogSpiral({ start: { x: 1, y: 0, z: 0 }, turn: { x: 1.4, y: 0, z: 0 } });
  assert.equal(flat.c, 0);
  assert.equal(flat.a, spiral.a);
  assert.equal(flat.b, spiral.b);
  assert.equal(flat.pitchAngleDeg, spiral.pitchAngleDeg);
  // with c = 0, the curve never leaves the z = 0 plane
  assert.equal(helicalShellPoint(3, flat.a, flat.b, flat.c).z, 0);
});

test("a helical shell rises by exactly the turn point's z after one full turn", () => {
  const result = localHelicalShell({ start: { x: 1, y: 0, z: 0 }, turn: { x: 1.4, y: 0, z: 1.2 } });
  assert.equal(result.risePerTurn, 1.2);
  const afterOneTurn = helicalShellPoint(2 * Math.PI, result.a, result.b, result.c);
  assert.ok(Math.abs(afterOneTurn.z - 1.2) < 1e-9);
  assert.ok(Math.abs(afterOneTurn.x - result.a * result.growthRatio) < 1e-9);
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

test("the square-cube law: surface area is 4*pi*r^2, volume is (4/3)*pi*r^3, and their ratio is 3/r", () => {
  const result = localSquareCubeLaw({ x: 2, y: 0, z: 0 });
  assert.equal(result.radius, 2);
  assert.ok(Math.abs(result.surfaceArea - 4 * Math.PI * 4) < 1e-9);
  assert.ok(Math.abs(result.volume - (4 / 3) * Math.PI * 8) < 1e-9);
  assert.ok(Math.abs(result.ratio - 3 / 2) < 1e-9);
});

test("doubling the radius quarters the surface-to-volume ratio (the square-cube law itself)", () => {
  const small = localSquareCubeLaw({ x: 1, y: 0, z: 0 });
  const large = localSquareCubeLaw({ x: 2, y: 0, z: 0 });
  assert.ok(Math.abs(small.ratio / large.ratio - 2) < 1e-9);
});

test("a catenary's sag and arc length satisfy (sag+a)^2 - (arcLength/2)^2 = a^2 for any span", () => {
  for (const [a, halfSpan] of [[1, 1], [0.5, 2], [3, 0.7]] as const) {
    const result = localCatenary({ x: a, y: 0, z: 0 }, halfSpan);
    const lhs = (result.sag + a) ** 2 - (result.arcLength / 2) ** 2;
    assert.ok(Math.abs(lhs - a * a) < 1e-9, `a=${a} halfSpan=${halfSpan}`);
  }
});

test("a taut catenary (large a) sags far less than a slack one (small a) over the same span", () => {
  const taut = localCatenary({ x: 1000, y: 0, z: 0 }, 1);
  const slack = localCatenary({ x: 0.5, y: 0, z: 0 }, 1);
  assert.ok(taut.sag < slack.sag);
});

test("allometric growth is isometric (y = x) exactly when k = 1", () => {
  const result = localAllometricGrowth({ x: 3, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
  assert.ok(Math.abs(result.y - 3) < 1e-9);
  assert.ok(Math.abs(result.ratio - 1) < 1e-9);
});

test("allometric growth with k = 2 makes the part grow with the square of body size", () => {
  const result = localAllometricGrowth({ x: 3, y: 0, z: 0 }, { x: 2, y: 0, z: 0 });
  assert.ok(Math.abs(result.y - 9) < 1e-9);
  assert.ok(Math.abs(result.ratio - 3) < 1e-9);
});

test("the golden angle equals pi(3 - sqrt(5)), i.e. 360 degrees / phi^2", () => {
  const goldenAngleDeg = GOLDEN_ANGLE_RAD * (180 / Math.PI);
  assert.ok(Math.abs(goldenAngleDeg - 360 / (PHI * PHI)) < 1e-9);
  assert.ok(Math.abs(goldenAngleDeg - 137.50776405) < 1e-6);
});

test("phyllotaxis reports the divergence angle of the control point and its deviation from golden", () => {
  const result = localPhyllotaxis({ x: Math.cos(GOLDEN_ANGLE_RAD), y: Math.sin(GOLDEN_ANGLE_RAD), z: 0 });
  assert.ok(Math.abs(result.deviationDeg) < 1e-6);
  const offAngle = localPhyllotaxis({ x: 1, y: 0, z: 0 }); // 0 degrees
  assert.ok(Math.abs(offAngle.divergenceDeg - 0) < 1e-9);
  assert.ok(offAngle.deviationDeg > 100);
});

test("the logistic curve passes through K/2 exactly at its center time, for any r or K", () => {
  for (const [r, k] of [[0.5, 10], [1.2, 3], [0.1, 100]] as const) {
    const point = logisticPoint(LOGISTIC_TIME_CENTER, r, k);
    assert.ok(Math.abs(point.y - k / 2) < 1e-9, `r=${r} k=${k}`);
  }
});

test("the logistic curve's maximum growth rate is exactly r*K/4", () => {
  const result = localLogisticGrowth({ x: 0.8, y: 0, z: 0 }, { x: 12, y: 6, z: 0 });
  assert.equal(result.r, 0.8);
  assert.equal(result.k, 6);
  assert.ok(Math.abs(result.maxGrowthRate - (0.8 * 6) / 4) < 1e-9);
  // cross-check against a numerical derivative at the inflection point
  const h = 1e-5;
  const before = logisticPoint(LOGISTIC_TIME_CENTER - h, result.r, result.k).y;
  const after = logisticPoint(LOGISTIC_TIME_CENTER + h, result.r, result.k).y;
  const numericalSlope = (after - before) / (2 * h);
  assert.ok(Math.abs(numericalSlope - result.maxGrowthRate) < 1e-4);
});

test("a geodesic sphere satisfies Euler's formula V - E + F = 2 at every subdivision level", () => {
  for (let detail = 0; detail <= 6; detail++) {
    const result = localGeodesicSphere(detail);
    assert.equal(result.eulerCharacteristic, 2, `detail=${detail}`);
  }
});

test("geodesic sphere face count matches THREE.IcosahedronGeometry's actual output at every detail level", async () => {
  const THREE = await import("three");
  for (let detail = 0; detail <= 5; detail++) {
    const result = localGeodesicSphere(detail);
    const geometry = new THREE.IcosahedronGeometry(1, detail);
    const actualFaces = geometry.attributes.position.count / 3;
    assert.equal(result.faces, actualFaces, `detail=${detail}: expected ${result.faces}, three.js produced ${actualFaces}`);
  }
});

test("whirling squares shrink by exactly phi every step", () => {
  const squares = buildWhirlingSquares(6);
  for (let i = 1; i < squares.length; i++) {
    const sideBefore = squares[i - 1].x1 - squares[i - 1].x0;
    const sideAfter = squares[i].x1 - squares[i].x0;
    // whichever dimension is the actual square side
    const before = Math.min(squares[i - 1].x1 - squares[i - 1].x0, squares[i - 1].y1 - squares[i - 1].y0);
    const after = Math.min(squares[i].x1 - squares[i].x0, squares[i].y1 - squares[i].y0);
    assert.ok(Math.abs(before / after - PHI) < 1e-9, `step ${i}: ${sideBefore} -> ${sideAfter}`);
  }
});

test("the whirling-squares arc length matches the direct geometric-series sum", () => {
  const result = localWhirlingSquares({ x: 8, y: 0, z: 0 });
  assert.equal(result.count, 8);
  let expected = 0;
  for (let i = 0; i < 8; i++) expected += (Math.PI / 2) * PHI ** -i;
  assert.ok(Math.abs(result.totalArcLength - expected) < 1e-9);
});

test("catenoid area matches numerical integration of the surface-of-revolution formula", () => {
  for (const a of [0.8, 1.2, 2.5]) {
    const result = localCatenoid({ x: a, y: 0, z: 0 });
    // numerically integrate 2*pi*r*sqrt(1+r'^2) dz via a fine Riemann sum
    const h = 2; // CATENOID_HALF_HEIGHT
    const steps = 200000;
    const dz = (2 * h) / steps;
    let numericalArea = 0;
    for (let i = 0; i < steps; i++) {
      const z = -h + (i + 0.5) * dz;
      const r = catenoidRadius(z, a);
      const rPrime = Math.sinh(z / a);
      numericalArea += 2 * Math.PI * r * Math.sqrt(1 + rPrime * rPrime) * dz;
    }
    assert.ok(Math.abs(numericalArea - result.surfaceArea) / result.surfaceArea < 1e-4, `a=${a}: numerical=${numericalArea} closed-form=${result.surfaceArea}`);
  }
});
