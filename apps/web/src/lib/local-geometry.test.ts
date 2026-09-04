import test from "node:test";
import assert from "node:assert/strict";
import type { Vec3 } from "../types/geometry.ts";
import {
  CELL_RING_SITES,
  DEFAULT_TRANSFORM_CORNERS,
  bilinearPoint,
  localCartesianTransform,
  localCellPacking,
  buildWhirlingSquares,
  catenaryAFromSag,
  catenoidHelicoidMorphPoint,
  catenoidRadius,
  BEE_CELL_MAX_RISE,
  BEE_CELL_MIN_RISE,
  BEE_CELL_OPTIMAL_RISE,
  beeCellApex,
  beeCellRimVertex,
  EGG_CENTER_DISTANCE,
  eggProfilePoints,
  GOLDEN_ANGLE_RAD,
  HELICOID_TURNS,
  localAllometricGrowth,
  localAngle,
  localBeeCell,
  localCatenary,
  localCatenoid,
  localCircleMeasures,
  localClosestPointAABB,
  localClosestPointSegment,
  localEggCurve,
  localGeodesicSphere,
  localHelicalShell,
  localHelicoid,
  localIntersectRayAABB,
  localIntersectRayPlane,
  localLogisticGrowth,
  LOGISTIC_TIME_CENTER,
  localLogSpiral,
  localMilkCoronet,
  localPhyllotaxis,
  localPythagorean,
  localRegularPolygon,
  localRightTriangleTrig,
  localSquareCubeLaw,
  localTransformations,
  localWhirlingSquares,
  logisticPoint,
  MILK_CORONET_MAX_POINTS,
  PHI,
  polygonArea,
  polygonPerimeter,
  REGULAR_POLYGON_MAX_SIDES,
  regularPolygonVertex,
  RIGHT_TRIANGLE_TRIG_HYPOTENUSE,
  TRANSFORM_BASE_TRIANGLE,
  transformTrianglePoint,
  helicalShellPoint,
  localProjectPointToPlane,
  localSegmentSegment,
  classifyConic,
  crossSectionCurvePoints,
  foldCubeNet,
  localCrossSection,
  localNet,
  localSolid,
  netCubeFaces,
  NET_CUBE_SIDE,
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

test("catenaryAFromSag inverts localCatenary's sag exactly, for dragging an endpoint to a target sag", () => {
  for (const [a, halfSpan] of [[1, 1], [0.5, 2], [3, 0.7], [12, 1.5]] as const) {
    const { sag } = localCatenary({ x: a, y: 0, z: 0 }, halfSpan);
    const recovered = catenaryAFromSag(sag, halfSpan);
    assert.ok(Math.abs(recovered - a) / a < 1e-6, `a=${a} halfSpan=${halfSpan} recovered=${recovered}`);
  }
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

test("catenoidHelicoidMorphPoint reduces to a real catenoid at theta=pi/2 and a real helicoid at theta=0", () => {
  for (const u of [0.3, 1.7, 4.0]) {
    for (const v of [-0.9, 0, 1.1]) {
      const catenoidExtreme = catenoidHelicoidMorphPoint(u, v, Math.PI / 2);
      // Unit-scale catenoid: radius at height v is cosh(v) = catenoidRadius(v, 1); z is v itself.
      assert.ok(Math.abs(Math.hypot(catenoidExtreme.x, catenoidExtreme.y) - catenoidRadius(v, 1)) < 1e-9);
      assert.ok(Math.abs(catenoidExtreme.z - v) < 1e-9);

      const helicoidExtreme = catenoidHelicoidMorphPoint(u, v, 0);
      // Helicoid: distance from the axis is |sinh(v)|, and height equals the sweep angle u — the screw property.
      assert.ok(Math.abs(Math.hypot(helicoidExtreme.x, helicoidExtreme.y) - Math.abs(Math.sinh(v))) < 1e-9);
      assert.ok(Math.abs(helicoidExtreme.z - u) < 1e-9);
    }
  }
});

test("the catenoid-helicoid associate family preserves its first fundamental form across theta — a genuine isometric bend, not a stretch", () => {
  // E, F, G (the metric coefficients from the surface's partial derivatives)
  // are what "intrinsic geometry" means precisely: if they're the same at
  // every theta for the same (u, v), every length and angle measured *on*
  // the surface is unchanged as it bends from a helicoid into a catenoid.
  const h = 1e-5;
  const fundamentalForm = (u: number, v: number, theta: number) => {
    const p = catenoidHelicoidMorphPoint(u, v, theta);
    const pu = catenoidHelicoidMorphPoint(u + h, v, theta);
    const pv = catenoidHelicoidMorphPoint(u, v + h, theta);
    const Xu = { x: (pu.x - p.x) / h, y: (pu.y - p.y) / h, z: (pu.z - p.z) / h };
    const Xv = { x: (pv.x - p.x) / h, y: (pv.y - p.y) / h, z: (pv.z - p.z) / h };
    const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
    return { E: dot(Xu, Xu), F: dot(Xu, Xv), G: dot(Xv, Xv) };
  };
  for (const u of [0.4, 2.1]) {
    for (const v of [-0.7, 0.5]) {
      const reference = fundamentalForm(u, v, 0);
      for (const theta of [0.3, Math.PI / 4, 1.1, Math.PI / 2]) {
        const form = fundamentalForm(u, v, theta);
        assert.ok(Math.abs(form.E - reference.E) < 1e-3, `E mismatch at theta=${theta}`);
        assert.ok(Math.abs(form.F - reference.F) < 1e-3, `F mismatch at theta=${theta}`);
        assert.ok(Math.abs(form.G - reference.G) < 1e-3, `G mismatch at theta=${theta}`);
      }
    }
  }
});

test("a milk-coronet's inscribed polygon perimeter matches an independent law-of-cosines chord derivation", () => {
  const result = localMilkCoronet({ x: 2, y: 0, z: 0 }, { x: 12, y: 0, z: 0 });
  assert.equal(result.points, 12);
  // Chord length via the law of cosines on two radius-R spokes separated
  // by the central angle 2*pi/N, entirely independent of the half-angle
  // sine identity the implementation actually uses.
  const centralAngle = (2 * Math.PI) / result.points;
  const chordViaLawOfCosines = Math.sqrt(2 * result.radius * result.radius * (1 - Math.cos(centralAngle)));
  assert.ok(Math.abs(result.polygonPerimeter - result.points * chordViaLawOfCosines) < 1e-9);
});

test("a milk-coronet's polygon deficit from the true circle shrinks like 1/N^2 as points increase (Archimedes' exhaustion)", () => {
  const radius = 3;
  const deficits = [8, 16, 32, MILK_CORONET_MAX_POINTS].map((n) => {
    const result = localMilkCoronet({ x: radius, y: 0, z: 0 }, { x: n, y: 0, z: 0 });
    return { n, deficit: result.circleDeficit };
  });
  // deficit ≈ (pi^3 * R) / (3 N^2) for large N — check the asymptotic
  // constant is converged on, not just that the deficit is decreasing.
  for (const { n, deficit } of deficits) {
    const predicted = (Math.PI ** 3 * radius) / (3 * n * n);
    assert.ok(Math.abs(deficit - predicted) / predicted < 0.02, `n=${n}: deficit=${deficit} predicted=${predicted}`);
  }
  for (let i = 1; i < deficits.length; i++) {
    assert.ok(deficits[i].deficit < deficits[i - 1].deficit);
  }
});

test("an egg's common tangent line is genuinely tangent to both the round and pointed circles", () => {
  const bigRadius = 1.4;
  const smallRadius = 0.7;
  const samplesPerArc = 24;
  const profile = eggProfilePoints(bigRadius, smallRadius, samplesPerArc);
  const tangentStart = profile[samplesPerArc];
  const tangentEnd = profile[samplesPerArc + 8];
  const distanceToLine = (center: [number, number]) => {
    const [x1, y1] = tangentStart;
    const [x2, y2] = tangentEnd;
    const [x0, y0] = center;
    const numerator = Math.abs((x2 - x1) * (y0 - y1) - (x0 - x1) * (y2 - y1));
    const denominator = Math.hypot(x2 - x1, y2 - y1);
    return numerator / denominator;
  };
  assert.ok(Math.abs(distanceToLine([0, 0]) - smallRadius) < 1e-9);
  assert.ok(Math.abs(distanceToLine([0, EGG_CENTER_DISTANCE]) - bigRadius) < 1e-9);
});

test("an egg's perimeter and surface area match a fine numerical trace of its own profile", () => {
  const bigRadius = 1.5;
  const smallRadius = 0.6;
  const result = localEggCurve({ x: bigRadius, y: 0, z: 0 }, { x: smallRadius, y: 0, z: 0 });
  const profile = eggProfilePoints(bigRadius, smallRadius, 4000);
  let halfPerimeter = 0;
  let surfaceArea = 0;
  for (let i = 1; i < profile.length; i++) {
    const [r1, z1] = profile[i - 1];
    const [r2, z2] = profile[i];
    const segmentLength = Math.hypot(r2 - r1, z2 - z1);
    halfPerimeter += segmentLength;
    // Pappus's theorem for a frustum: lateral area = pi*(r1+r2)*slant length.
    // This is the FULL revolved area already (revolving a half-profile
    // 360 degrees sweeps out the whole solid), unlike the perimeter below.
    surfaceArea += Math.PI * (r1 + r2) * segmentLength;
  }
  // The profile traces only the upper half of the closed 2D egg outline
  // (tip to tip); the lower half mirrors it exactly, so the full 2D
  // perimeter is twice this trace's length.
  assert.ok(Math.abs(2 * halfPerimeter - result.perimeter) / result.perimeter < 1e-4);
  assert.ok(Math.abs(surfaceArea - result.surfaceArea) / result.surfaceArea < 1e-4);
});

test("an egg with equal radii reduces to the known spherocylinder (capsule) perimeter and surface area", () => {
  const r = 1;
  const result = localEggCurve({ x: r, y: 0, z: 0 }, { x: r, y: 0, z: 0 });
  const d = EGG_CENTER_DISTANCE;
  // Two equal circles joined by common tangents degenerate to a stadium:
  // two semicircles (perimeter pi*r each) plus two straight sides of
  // length d — and, revolved, two hemispherical caps (4*pi*r^2 combined)
  // plus a cylinder's lateral area (2*pi*r*d).
  assert.ok(Math.abs(result.perimeter - (2 * Math.PI * r + 2 * d)) < 1e-9);
  assert.ok(Math.abs(result.surfaceArea - (4 * Math.PI * r * r + 2 * Math.PI * r * d)) < 1e-9);
});

test("a helicoid's surface area matches a fine numerical double integral of its surface element", () => {
  for (const [radius, risePerTurn] of [[1.5, 2], [2.2, 4], [1, 0.5]] as const) {
    const result = localHelicoid({ x: radius, y: 0, z: 0 }, { x: 0, y: 0, z: risePerTurn });
    const uSteps = 400;
    const totalAngle = HELICOID_TURNS * 2 * Math.PI;
    const du = radius / uSteps;
    // The surface element sqrt(u^2+c^2) doesn't depend on v, so the double
    // integral over v just scales a 1D Riemann sum over u by the total
    // sweep angle.
    let uIntegral = 0;
    for (let i = 0; i < uSteps; i++) {
      const u = (i + 0.5) * du;
      uIntegral += Math.sqrt(u * u + result.c * result.c) * du;
    }
    const numericalArea = uIntegral * totalAngle;
    assert.ok(Math.abs(numericalArea - result.area) / result.area < 1e-3, `r=${radius}: numerical=${numericalArea} closed-form=${result.area}`);
  }
});

function vecSub(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function vecCross(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function vecLength(a: { x: number; y: number; z: number }) {
  return Math.hypot(a.x, a.y, a.z);
}
function vecDot(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

test("a bee cell's closing quadrilateral is genuinely planar and a rhombus for every rise, independent of the diagonal-product formula", () => {
  for (const x of [0.1, 0.35355339, 0.7, 1.05]) {
    const apex = beeCellApex(x);
    for (let i = 0; i < 6; i += 2) {
      const kept1 = beeCellRimVertex(i, x);
      const trimmed = beeCellRimVertex(i + 1, x);
      const kept2 = beeCellRimVertex((i + 2) % 6, x);
      // Planarity: the vector to the apex must lie in the plane spanned
      // by the other two edges from kept1 (triple product ~ 0).
      const normal = vecCross(vecSub(trimmed, kept1), vecSub(kept2, kept1));
      const planarity = Math.abs(vecDot(normal, vecSub(apex, kept1)));
      assert.ok(planarity < 1e-9, `x=${x}: not planar, triple product=${planarity}`);
      // Rhombus: all four sides equal.
      const sides = [
        vecLength(vecSub(trimmed, kept1)),
        vecLength(vecSub(kept2, trimmed)),
        vecLength(vecSub(apex, kept2)),
        vecLength(vecSub(kept1, apex)),
      ];
      const spread = Math.max(...sides) - Math.min(...sides);
      assert.ok(spread < 1e-9, `x=${x}: sides not equal, spread=${spread}, sides=${sides}`);
    }
  }
});

test("a bee cell's rhombus area formula matches a direct cross-product quadrilateral area from its vertices", () => {
  for (const x of [0.15, 0.5, 0.9]) {
    const apex = beeCellApex(x);
    const kept1 = beeCellRimVertex(0, x);
    const trimmed = beeCellRimVertex(1, x);
    const kept2 = beeCellRimVertex(2, x);
    const triangle1 = vecLength(vecCross(vecSub(trimmed, kept1), vecSub(kept2, kept1))) / 2;
    const triangle2 = vecLength(vecCross(vecSub(kept2, kept1), vecSub(apex, kept1))) / 2;
    const directArea = triangle1 + triangle2;
    const result = localBeeCell({ x, y: 0, z: 0 });
    assert.ok(Math.abs(directArea - result.rhombusArea) < 1e-9, `x=${x}: direct=${directArea} formula=${result.rhombusArea}`);
  }
});

test("a bee cell's total surface area is genuinely minimized at rise x = 1/(2*sqrt(2)), the historical Maclaurin optimum", () => {
  const optimal = localBeeCell({ x: BEE_CELL_OPTIMAL_RISE, y: 0, z: 0 });
  // Sweep a fine grid of rises and confirm none does better than the
  // claimed optimum — a numerical, from-scratch confirmation rather
  // than trusting the closed-form derivative algebra alone.
  let best = Infinity;
  let bestX = -1;
  const steps = 20000;
  for (let i = 0; i <= steps; i++) {
    const x = BEE_CELL_MIN_RISE + (i / steps) * (BEE_CELL_MAX_RISE - BEE_CELL_MIN_RISE);
    const area = localBeeCell({ x, y: 0, z: 0 }).totalSurfaceArea;
    if (area < best) {
      best = area;
      bestX = x;
    }
  }
  assert.ok(Math.abs(bestX - BEE_CELL_OPTIMAL_RISE) < 1e-3, `grid search optimum x=${bestX}, expected ${BEE_CELL_OPTIMAL_RISE}`);
  assert.ok(Math.abs(best - optimal.totalSurfaceArea) < 1e-6);
  // And confirm it actually IS a minimum, not a saddle or endpoint: area
  // strictly increases moving away from it on both sides.
  const below = localBeeCell({ x: BEE_CELL_OPTIMAL_RISE - 0.1, y: 0, z: 0 }).totalSurfaceArea;
  const above = localBeeCell({ x: BEE_CELL_OPTIMAL_RISE + 0.1, y: 0, z: 0 }).totalSurfaceArea;
  assert.ok(below > optimal.totalSurfaceArea);
  assert.ok(above > optimal.totalSurfaceArea);
});

test("at the optimal rise, the ridge-to-axis angle is exactly arccos(1/3) ≈ 70.53°, the historically cited bee-cell angle", () => {
  const result = localBeeCell({ x: BEE_CELL_OPTIMAL_RISE, y: 0, z: 0 });
  const expectedDeg = Math.acos(1 / 3) * (180 / Math.PI);
  assert.ok(Math.abs(result.ridgeAngleDeg - expectedDeg) < 1e-6);
  assert.ok(Math.abs(expectedDeg - 70.5288) < 1e-3);
});

test("angles are classified correctly at and around every boundary, with complement and supplement only where they're defined", () => {
  const acute = localAngle({ x: 1, y: 1, z: 0 }); // 45 degrees
  assert.equal(acute.classification, "acute");
  assert.ok(Math.abs(acute.angleDeg - 45) < 1e-9);
  assert.ok(Math.abs((acute.complementDeg ?? NaN) - 45) < 1e-9);
  assert.ok(Math.abs((acute.supplementDeg ?? NaN) - 135) < 1e-9);

  const right = localAngle({ x: 0, y: 1, z: 0 }); // 90 degrees
  assert.equal(right.classification, "right");
  assert.equal(right.complementDeg, 0);

  const obtuse = localAngle({ x: -1, y: 1, z: 0 }); // 135 degrees
  assert.equal(obtuse.classification, "obtuse");
  assert.equal(obtuse.complementDeg, null);
  assert.ok(Math.abs((obtuse.supplementDeg ?? NaN) - 45) < 1e-9);

  const straight = localAngle({ x: -1, y: 0, z: 0 }); // 180 degrees
  assert.equal(straight.classification, "straight");
  assert.equal(straight.supplementDeg, 0);

  const reflex = localAngle({ x: 0, y: -1, z: 0 }); // 270 degrees
  assert.equal(reflex.classification, "reflex");
  assert.equal(reflex.complementDeg, null);
  assert.equal(reflex.supplementDeg, null);
});

test("a reflex angle's own measure differs from the unsigned (non-reflex) angle between the same two rays", () => {
  // 270 degrees swept counterclockwise from the fixed ray, but the
  // UNDIRECTED angle between the two rays (via the dot product, which
  // can't tell which way you swept) is only 90 degrees -- exactly why a
  // reflex angle needs its own directed convention.
  const rayB = { x: 0, y: -1, z: 0 };
  const reflex = localAngle(rayB);
  assert.ok(Math.abs(reflex.angleDeg - 270) < 1e-9);
  const undirectedDeg = Math.acos(rayB.x / Math.hypot(rayB.x, rayB.y)) * (180 / Math.PI);
  assert.ok(Math.abs(undirectedDeg - 90) < 1e-9);
  assert.notEqual(Math.round(reflex.angleDeg), Math.round(undirectedDeg));
});

test("the Pythagorean theorem holds exactly for a classic 3-4-5 triangle and is cross-checked by the law of cosines at 90°", () => {
  const result = localPythagorean({ x: 3, y: 0, z: 0 }, { x: 4, y: 0, z: 0 });
  assert.ok(Math.abs(result.hypotenuse - 5) < 1e-9);
  assert.equal(result.triangleType, "scalene");

  for (const [a, b] of [[1, 1], [5, 12], [2.5, 6.5]] as const) {
    const r = localPythagorean({ x: a, y: 0, z: 0 }, { x: b, y: 0, z: 0 });
    // law of cosines: c^2 = a^2 + b^2 - 2ab*cos(90 degrees), independent
    // of the a^2+b^2 formula the implementation actually uses.
    const viaLawOfCosines = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(Math.PI / 2));
    assert.ok(Math.abs(r.hypotenuse - viaLawOfCosines) < 1e-9);
  }
  assert.equal(localPythagorean({ x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }).triangleType, "isosceles");
});

test("right-triangle trig satisfies the Pythagorean identity and tan = sin/cos independently of how each is computed", () => {
  for (const [x, y] of [[1, 0.3], [0.5, 2], [2, 2]] as const) {
    const result = localRightTriangleTrig({ x, y, z: 0 });
    assert.ok(Math.abs(result.sin * result.sin + result.cos * result.cos - 1) < 1e-9);
    assert.ok(Math.abs(result.tan - result.sin / result.cos) < 1e-9);
    // opposite^2 + adjacent^2 == hypotenuse^2, the Pythagorean theorem
    // applied to this same triangle, independent of the sin/cos used.
    assert.ok(Math.abs(result.opposite ** 2 + result.adjacent ** 2 - result.hypotenuse ** 2) < 1e-9);
    assert.equal(result.hypotenuse, RIGHT_TRIANGLE_TRIG_HYPOTENUSE);
  }
});

test("a circle's circumference and area are approached by an inscribed regular polygon's perimeter and area as its side count grows", () => {
  const radius = 2.5;
  const circle = localCircleMeasures({ x: radius, y: 0, z: 0 }, { x: 1, y: 1, z: 0 });
  for (const sides of [12, 48, 200]) {
    const vertices = Array.from({ length: sides }, (_, i) => regularPolygonVertex(i, sides, radius));
    const perimeter = polygonPerimeter(vertices);
    const area = polygonArea(vertices);
    const perimeterError = Math.abs(perimeter - circle.circumference) / circle.circumference;
    const areaError = Math.abs(area - circle.area) / circle.area;
    assert.ok(perimeterError < 20 / (sides * sides), `sides=${sides}: perimeter error ${perimeterError}`);
    assert.ok(areaError < 20 / (sides * sides), `sides=${sides}: area error ${areaError}`);
  }
});

test("a circular sector's area matches a fine fan-of-triangles numerical approximation, independent of the (1/2)r^2*theta formula", () => {
  const radius = 1.8;
  for (const [x, y] of [[1, 0.6], [-1, 1], [0.2, -1]] as const) {
    const circle = localCircleMeasures({ x: radius, y: 0, z: 0 }, { x, y, z: 0 });
    const theta = circle.centralAngleDeg * (Math.PI / 180);
    const steps = 20000;
    let numericalArea = 0;
    for (let i = 0; i < steps; i++) {
      const d = theta / steps;
      // area of a thin triangle fan slice: (1/2)*r^2*sin(d) -- exact for
      // a triangle, not an approximation of one, so this is a genuinely
      // different (if still convergent) computation from r^2*theta/2.
      numericalArea += 0.5 * radius * radius * Math.sin(d);
    }
    assert.ok(Math.abs(numericalArea - circle.sectorArea) / circle.sectorArea < 1e-6);
  }
});

test("a regular polygon's area and perimeter match direct shoelace/edge-sum measurements of its own vertices", () => {
  for (const sides of [3, 6, 9, 15]) {
    const circumradius = 1.7;
    const result = localRegularPolygon({ x: sides, y: 0, z: 0 }, { x: circumradius, y: 0, z: 0 });
    const vertices = Array.from({ length: sides }, (_, i) => regularPolygonVertex(i, sides, circumradius));
    assert.ok(Math.abs(result.area - polygonArea(vertices)) < 1e-9);
    assert.ok(Math.abs(result.perimeter - polygonPerimeter(vertices)) < 1e-9);
    // interior angle sum of any simple polygon is (n-2)*180.
    assert.ok(Math.abs(result.interiorAngleDeg * sides - (sides - 2) * 180) < 1e-9);
  }
  // as sides -> max, both measurements should approach the circumscribed circle's.
  const many = localRegularPolygon({ x: REGULAR_POLYGON_MAX_SIDES, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
  assert.ok(Math.abs(many.area - Math.PI) / Math.PI < 0.02);
  assert.ok(Math.abs(many.perimeter - 2 * Math.PI) / (2 * Math.PI) < 0.02);
});

test("a similarity transformation (translate + rotate + scale) preserves every angle of the triangle exactly", () => {
  for (const [tx, ty, rotDeg, scale] of [[0, 0, 0, 1], [2, -1.5, 40, 1.8], [-3, 4, 200, 0.4]] as const) {
    const handle = { x: scale * 2 * Math.cos(rotDeg * (Math.PI / 180)), y: scale * 2 * Math.sin(rotDeg * (Math.PI / 180)), z: 0 };
    const result = localTransformations({ x: tx, y: ty, z: 0 }, handle);
    assert.ok(Math.abs(result.sampleAngleBeforeDeg - result.sampleAngleAfterDeg) < 1e-6, `rotDeg=${rotDeg}: before=${result.sampleAngleBeforeDeg} after=${result.sampleAngleAfterDeg}`);
  }
});

test("a translate-only transform shifts every vertex by exactly the translation, and a scale-only transform multiplies every side length by exactly the scale factor", () => {
  const translateOnly = TRANSFORM_BASE_TRIANGLE.map((p) => transformTrianglePoint(p, { x: 5, y: -2 }, 0, 1));
  TRANSFORM_BASE_TRIANGLE.forEach((p, i) => {
    assert.ok(Math.abs(translateOnly[i].x - (p.x + 5)) < 1e-9);
    assert.ok(Math.abs(translateOnly[i].y - (p.y - 2)) < 1e-9);
  });

  const scale = 2.3;
  const scaledOnly = TRANSFORM_BASE_TRIANGLE.map((p) => transformTrianglePoint(p, { x: 0, y: 0 }, 0, scale));
  const sideLength = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(b.x - a.x, b.y - a.y);
  for (let i = 0; i < 3; i++) {
    const next = (i + 1) % 3;
    const before = sideLength(TRANSFORM_BASE_TRIANGLE[i], TRANSFORM_BASE_TRIANGLE[next]);
    const after = sideLength(scaledOnly[i], scaledOnly[next]);
    assert.ok(Math.abs(after / before - scale) < 1e-9);
  }
});

function faceArea(vertices: { x: number; y: number; z: number }[]): number {
  // sum of triangle-fan areas via cross product, works for any planar polygon
  let total = 0;
  for (let i = 1; i < vertices.length - 1; i++) {
    total += vecLength(vecCross(vecSub(vertices[i], vertices[0]), vecSub(vertices[i + 1], vertices[0]))) / 2;
  }
  return total;
}

test("a box/cube's surface area matches the sum of its six real rectangular faces' areas", () => {
  for (const [a, b, c] of [[1, 1, 1], [1.5, 0.8, 2.2]] as const) {
    const solidType = a === b && b === c ? "cube" : "box";
    const result = localSolid(solidType, a, b, c);
    const hx = a / 2, hy = b / 2, hz = c / 2;
    const corner = (sx: number, sy: number, sz: number) => ({ x: sx * hx, y: sy * hy, z: sz * hz });
    const faces = [
      [corner(-1, -1, -1), corner(1, -1, -1), corner(1, 1, -1), corner(-1, 1, -1)], // bottom
      [corner(-1, -1, 1), corner(1, -1, 1), corner(1, 1, 1), corner(-1, 1, 1)], // top
      [corner(-1, -1, -1), corner(1, -1, -1), corner(1, -1, 1), corner(-1, -1, 1)], // front
      [corner(-1, 1, -1), corner(1, 1, -1), corner(1, 1, 1), corner(-1, 1, 1)], // back
      [corner(-1, -1, -1), corner(-1, 1, -1), corner(-1, 1, 1), corner(-1, -1, 1)], // left
      [corner(1, -1, -1), corner(1, 1, -1), corner(1, 1, 1), corner(1, -1, 1)], // right
    ];
    const summedArea = faces.reduce((sum, face) => sum + faceArea(face), 0);
    assert.ok(Math.abs(summedArea - result.surfaceArea) < 1e-9, `${solidType}: summed=${summedArea} formula=${result.surfaceArea}`);
  }
});

test("a cylinder's volume and surface area match fine numerical integration, independent of the closed-form formulas", () => {
  for (const [r, h] of [[1, 2], [0.7, 1.6]] as const) {
    const result = localSolid("cylinder", r, h, 0);
    const steps = 100000;
    let volume = 0;
    let lateralArea = 0;
    const dz = h / steps;
    for (let i = 0; i < steps; i++) {
      volume += Math.PI * r * r * dz; // constant-radius disk stack
      lateralArea += 2 * Math.PI * r * dz; // constant-radius ring stack
    }
    const surfaceArea = lateralArea + 2 * Math.PI * r * r;
    assert.ok(Math.abs(volume - result.volume) / result.volume < 1e-6);
    assert.ok(Math.abs(surfaceArea - result.surfaceArea) / result.surfaceArea < 1e-6);
  }
});

test("a cone's volume and lateral surface area match fine numerical integration of a linearly tapering radius", () => {
  for (const [r, h] of [[1, 2], [1.3, 0.9]] as const) {
    const result = localSolid("cone", r, h, 0);
    const steps = 200000;
    const dz = h / steps;
    let volume = 0;
    let lateralArea = 0;
    const dr_dz = r / h;
    for (let i = 0; i < steps; i++) {
      const z = (i + 0.5) * dz;
      const radius = (r * z) / h;
      volume += Math.PI * radius * radius * dz;
      lateralArea += 2 * Math.PI * radius * Math.sqrt(1 + dr_dz * dr_dz) * dz;
    }
    const surfaceArea = lateralArea + Math.PI * r * r;
    assert.ok(Math.abs(volume - result.volume) / result.volume < 1e-4);
    assert.ok(Math.abs(surfaceArea - result.surfaceArea) / result.surfaceArea < 1e-4);
    assert.ok(Math.abs((result.slantHeight ?? NaN) - Math.hypot(r, h)) < 1e-9);
  }
});

test("a square pyramid's volume matches numerical integration of its shrinking cross-section, and its lateral face area matches a real 3D triangle", () => {
  for (const [a, h] of [[1.2, 2], [2, 1]] as const) {
    const result = localSolid("pyramid", a, h, 0);
    const steps = 200000;
    const dz = h / steps;
    let volume = 0;
    for (let i = 0; i < steps; i++) {
      const z = (i + 0.5) * dz;
      const side = (a * z) / h; // 0 at apex, a at the base
      volume += side * side * dz;
    }
    assert.ok(Math.abs(volume - result.volume) / result.volume < 1e-4);

    const apex = { x: 0, y: 0, z: h };
    const corner1 = { x: a / 2, y: -a / 2, z: 0 };
    const corner2 = { x: a / 2, y: a / 2, z: 0 };
    const lateralFaceArea = faceArea([corner1, corner2, apex]);
    const totalSurface = a * a + 4 * lateralFaceArea;
    assert.ok(Math.abs(totalSurface - result.surfaceArea) < 1e-9);
  }
});

test("a sphere's volume and surface area agree between the solids chapter and the independently-written square-cube-law chapter", () => {
  for (const r of [0.6, 1, 2.3]) {
    const solid = localSolid("sphere", r, 0, 0);
    const squareCube = localSquareCubeLaw({ x: r, y: 0, z: 0 });
    assert.ok(Math.abs(solid.volume - squareCube.volume) < 1e-9);
    assert.ok(Math.abs(solid.surfaceArea - squareCube.surfaceArea) < 1e-9);
  }
});

test("a cross-section's conic type is classified correctly at each side of the cone's own half-angle, and a perpendicular cut is circular", () => {
  const coneHalfAngleDeg = 30;
  const critical = 90 - coneHalfAngleDeg; // the plane tilt parallel to the cone's slant

  const circle = classifyConic(coneHalfAngleDeg, 0);
  assert.equal(circle.conicType, "circle");
  assert.ok(circle.discriminant < 0);

  const ellipse = classifyConic(coneHalfAngleDeg, critical - 10);
  assert.equal(ellipse.conicType, "ellipse");
  assert.ok(ellipse.discriminant < 0);

  const parabola = classifyConic(coneHalfAngleDeg, critical);
  assert.equal(parabola.conicType, "parabola");
  assert.ok(Math.abs(parabola.discriminant) < 1e-6);

  const hyperbola = classifyConic(coneHalfAngleDeg, critical + 10);
  assert.equal(hyperbola.conicType, "hyperbola");
  assert.ok(hyperbola.discriminant > 0);
});

test("localCrossSection's point-based tilt and offset agree with the angle and magnitude they encode", () => {
  const coneHalfAngleDeg = 30;
  const tiltDeg = 40;
  const tiltPoint = { x: Math.cos(tiltDeg * (Math.PI / 180)), y: Math.sin(tiltDeg * (Math.PI / 180)), z: 0 };
  const offsetPoint = { x: 2.5, y: 0, z: 0 };
  const result = localCrossSection(coneHalfAngleDeg, tiltPoint, offsetPoint);
  assert.ok(Math.abs(result.planeTiltDeg - tiltDeg) < 1e-6);
  assert.ok(Math.abs(result.planeOffset - 2.5) < 1e-9);
  // The wrapper's classification must agree with classifyConic given
  // the exact angle it just decoded from the point.
  const direct = classifyConic(coneHalfAngleDeg, result.planeTiltDeg);
  assert.equal(result.conicType, direct.conicType);
  assert.ok(Math.abs(result.discriminant - direct.discriminant) < 1e-9);

  // The offset is floored at 0.4 regardless of how close to the apex
  // the control point is dragged.
  const nearApex = localCrossSection(coneHalfAngleDeg, tiltPoint, { x: 0.01, y: 0, z: 0 });
  assert.equal(nearApex.planeOffset, 0.4);
});

test("a circular cross-section's sampled points are genuinely equidistant from the cone's own axis, at a constant height", () => {
  const coneHalfAngleDeg = 25;
  const planeOffset = 3;
  const branches = crossSectionCurvePoints(coneHalfAngleDeg, 0, planeOffset, 2, 200);
  const allPoints = branches.flat();
  assert.ok(allPoints.length > 10);
  for (const p of allPoints) {
    assert.ok(Math.abs(p.z - planeOffset) < 1e-9); // flat cut: constant height
    const radius = Math.hypot(p.x, p.y);
    const expectedRadius = planeOffset * Math.tan(coneHalfAngleDeg * (Math.PI / 180));
    assert.ok(Math.abs(radius - expectedRadius) < 1e-6);
  }
});

test("an ellipse cross-section's curve stays bounded, while a hyperbola's has disconnected branches reaching the sampled edge", () => {
  const coneHalfAngleDeg = 30;
  const critical = 90 - coneHalfAngleDeg;

  const ellipseBranches = crossSectionCurvePoints(coneHalfAngleDeg, critical - 15, 2, 10, 400);
  const ellipseYs = ellipseBranches.flat().map((p) => p.y);
  assert.ok(Math.max(...ellipseYs.map(Math.abs)) < 9.9, "ellipse should not reach the sampling boundary");

  const hyperbolaBranches = crossSectionCurvePoints(coneHalfAngleDeg, critical + 15, 2, 10, 400);
  assert.ok(hyperbolaBranches.length >= 2, "a hyperbola should keep at least two separate polylines (one per lobe)");
  const hyperbolaYs = hyperbolaBranches.flat().map((p) => p.y);
  assert.ok(Math.max(...hyperbolaYs.map(Math.abs)) > 9.5, "hyperbola should reach near the sampling boundary (it's unbounded)");
  // The two lobes of a hyperbola section genuinely cross into both nappes
  // of the double cone -- one lobe's z is positive, the other's negative.
  // A truncate-at-z=0 bug (checked in against exactly this) would delete
  // one lobe entirely and leave every remaining point on the same side.
  const hyperbolaZs = hyperbolaBranches.flat().map((p) => p.z);
  assert.ok(hyperbolaZs.some((z) => z > 0.5), "hyperbola should have points in the z>0 nappe");
  assert.ok(hyperbolaZs.some((z) => z < -0.5), "hyperbola should have points in the z<0 nappe too");
});

test("a cube's net matches the flat layout exactly when unfolded (t=0), and every hinge stays joined (no tearing) at every fold amount", () => {
  const s = 1.4;
  const flatFaces = netCubeFaces(s);
  const folded0 = foldCubeNet(s, 0);
  for (const key of ["base", "north", "south", "east", "west", "top"] as const) {
    flatFaces[key].vertices.forEach(([x, y], i) => {
      assert.ok(Math.abs(folded0[key][i].x - x) < 1e-9);
      assert.ok(Math.abs(folded0[key][i].y - y) < 1e-9);
      assert.ok(Math.abs(folded0[key][i].z - 0) < 1e-9);
    });
  }

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const folded = foldCubeNet(s, t);
    // base-north shared edge: base's top two corners == north's first two.
    assert.ok(vecLength(vecSub(folded.base[3], folded.north[0])) < 1e-9);
    assert.ok(vecLength(vecSub(folded.base[2], folded.north[1])) < 1e-9);
    // base-south shared edge
    assert.ok(vecLength(vecSub(folded.base[0], folded.south[0])) < 1e-9);
    assert.ok(vecLength(vecSub(folded.base[1], folded.south[1])) < 1e-9);
    // base-east shared edge
    assert.ok(vecLength(vecSub(folded.base[1], folded.east[0])) < 1e-9);
    assert.ok(vecLength(vecSub(folded.base[2], folded.east[1])) < 1e-9);
    // base-west shared edge
    assert.ok(vecLength(vecSub(folded.base[0], folded.west[0])) < 1e-9);
    assert.ok(vecLength(vecSub(folded.base[3], folded.west[1])) < 1e-9);
    // north-top shared edge (the compound hinge)
    assert.ok(vecLength(vecSub(folded.north[3], folded.top[0])) < 1e-9);
    assert.ok(vecLength(vecSub(folded.north[2], folded.top[1])) < 1e-9);
  }
});

test("a cube's net, fully folded (t=1), reproduces the exact corners of a real cube of the same side length", () => {
  const s = 1.4;
  const h = s / 2;
  const folded = foldCubeNet(s, 1);
  // The 8 corners of an actual axis-aligned cube of side s.
  const expectedCorners: Vec3[] = [];
  for (const sx of [-h, h]) for (const sy of [-h, h]) for (const sz of [0, s]) expectedCorners.push({ x: sx, y: sy, z: sz });
  const matchesACorner = (p: Vec3) => expectedCorners.some((c) => vecLength(vecSub(p, c)) < 1e-9);

  for (const key of ["base", "north", "south", "east", "west", "top"] as const) {
    for (const p of folded[key]) {
      assert.ok(matchesACorner(p), `${key} vertex not a real cube corner: ${JSON.stringify(p)}`);
    }
  }
  // Every face should also be planar and the right size at t=1 — spot
  // check the top face sits exactly at height s.
  for (const p of folded.top) assert.ok(Math.abs(p.z - s) < 1e-9);
});

test("the net's fold fraction is exposed and clamped to [0, 1] by localNet", () => {
  assert.equal(localNet({ x: 0.5, y: 0, z: 0 }).foldFraction, 0.5);
  assert.equal(localNet({ x: -1, y: 0, z: 0 }).foldFraction, 0);
  assert.equal(localNet({ x: 2, y: 0, z: 0 }).foldFraction, 1);
  assert.equal(localNet({ x: 0, y: 0, z: 0 }).side, NET_CUBE_SIDE);
});

test("solid dimensions are clamped to a sane range regardless of how far a control point is dragged", () => {
  const huge = localSolid("cube", 1000, 0, 0);
  assert.ok(huge.dimA <= 3);
  const tiny = localSolid("sphere", -50, 0, 0);
  assert.ok(tiny.dimA >= 0.3);
});
