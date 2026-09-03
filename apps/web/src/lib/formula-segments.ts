import type { PlaygroundState } from "@/store/playground-store";
import type { QueryType } from "@/types/geometry";
import { formatNumber } from "@/lib/format";
import {
  BEE_CELL_WALL_HEIGHT,
  CATENARY_HALF_SPAN,
  CATENOID_HALF_HEIGHT,
  EGG_CENTER_DISTANCE,
  HELICOID_TURNS,
  LOGISTIC_TIME_CENTER,
  PHI,
} from "@/lib/local-geometry";

// A formula is a sequence of inert text and hoverable terms. A term with
// a `targetId` matching a draggable point's `id` glows that point in the
// 3D scene (handled centrally by DraggablePoint) and shows a floating
// badge there; every term also shows its meaning and current value in a
// small tooltip right in the results panel, whether or not it has a 3D
// target — so a derived quantity with no single on-screen point (like an
// intermediate angle) is still explained on hover, just without a glow.
export type FormulaSegment =
  | { kind: "text"; text: string }
  | { kind: "term"; symbol: string; meaning: string; value: string; targetId?: string };

function text(t: string): FormulaSegment {
  return { kind: "text", text: t };
}

function term(symbol: string, meaning: string, value: string, targetId?: string): FormulaSegment {
  return { kind: "term", symbol, meaning, value, targetId };
}

const fmt = (v: number, state: PlaygroundState) => formatNumber(v, state.precision);

type FormulaBuilder = (state: PlaygroundState) => FormulaSegment[];

export const FORMULA_BUILDERS: Partial<Record<QueryType, FormulaBuilder>> = {
  "project-point-to-plane": (s) => [
    text("d = |(P − Q) · n̂| = "),
    term("d", "the perpendicular distance from P to the plane", s.projectPointResult ? fmt(s.projectPointResult.distance, s) : "—"),
    text(". "),
    term("P", "the point being projected — drag it to move the point", `(${fmt(s.point.x, s)}, ${fmt(s.point.y, s)}, ${fmt(s.point.z, s)})`, "point"),
    text(", "),
    term("Q", "a fixed point that lies on the plane", `(${fmt(s.planePoint.x, s)}, ${fmt(s.planePoint.y, s)}, ${fmt(s.planePoint.z, s)})`),
    text(", "),
    term("n̂", "the plane's unit normal — the direction perpendicular to it", `(${fmt(s.planeNormal.x, s)}, ${fmt(s.planeNormal.y, s)}, ${fmt(s.planeNormal.z, s)})`),
  ],
  "intersect-ray-plane": (s) => [
    text("t = ((Q − O) · n) / (d · n); d · n = "),
    term("d·n", "the dot product of the ray's direction and the plane's normal — zero exactly when the ray runs parallel to the plane", fmt(s.rayDir.x * s.planeNormal.x + s.rayDir.y * s.planeNormal.y + s.rayDir.z * s.planeNormal.z, s)),
    text(". "),
    term("O", "the ray's starting point — drag it to move the ray", `(${fmt(s.rayOrigin.x, s)}, ${fmt(s.rayOrigin.y, s)}, ${fmt(s.rayOrigin.z, s)})`, "rayOrigin"),
    text(", "),
    term("d", "the ray's fixed direction vector", `(${fmt(s.rayDir.x, s)}, ${fmt(s.rayDir.y, s)}, ${fmt(s.rayDir.z, s)})`),
    text(", "),
    term("Q", "a fixed point on the plane", `(${fmt(s.planePoint.x, s)}, ${fmt(s.planePoint.y, s)}, ${fmt(s.planePoint.z, s)})`),
    text(", "),
    term("n", "the plane's normal direction", `(${fmt(s.planeNormal.x, s)}, ${fmt(s.planeNormal.y, s)}, ${fmt(s.planeNormal.z, s)})`),
  ],
  "closest-point-segment": (s) => [
    text("t = clamp(((P − A) · (B − A)) / ‖B − A‖², 0, 1). "),
    term("P", "the point being measured from — drag it to move the point", `(${fmt(s.point.x, s)}, ${fmt(s.point.y, s)}, ${fmt(s.point.z, s)})`, "point"),
    text(", "),
    term("A", "one end of the segment", `(${fmt(s.segmentA.x, s)}, ${fmt(s.segmentA.y, s)}, ${fmt(s.segmentA.z, s)})`, "segmentA"),
    text(", "),
    term("B", "the other end of the segment", `(${fmt(s.segmentB.x, s)}, ${fmt(s.segmentB.y, s)}, ${fmt(s.segmentB.z, s)})`, "segmentB"),
    text(". t is how far along A→B the closest point sits, clamped to stay on the segment."),
  ],
  "segment-segment": (s) => [
    text("minimize ‖(A₁ + s·u) − (B₁ + t·v)‖ for s, t ∈ [0, 1]. "),
    term("A₁", "the start of segment A", `(${fmt(s.segmentA1.x, s)}, ${fmt(s.segmentA1.y, s)}, ${fmt(s.segmentA1.z, s)})`, "segmentA1"),
    text(", "),
    term("A₂", "the end of segment A — u is the vector A₁→A₂", `(${fmt(s.segmentA2.x, s)}, ${fmt(s.segmentA2.y, s)}, ${fmt(s.segmentA2.z, s)})`, "segmentA2"),
    text(", "),
    term("B₁", "the start of segment B", `(${fmt(s.segmentB1.x, s)}, ${fmt(s.segmentB1.y, s)}, ${fmt(s.segmentB1.z, s)})`, "segmentB1"),
    text(", "),
    term("B₂", "the end of segment B — v is the vector B₁→B₂", `(${fmt(s.segmentB2.x, s)}, ${fmt(s.segmentB2.y, s)}, ${fmt(s.segmentB2.z, s)})`, "segmentB2"),
  ],
  "intersect-ray-aabb": (s) => [
    text("intersect the X, Y, and Z ray slabs; hit when tEntry ≤ tExit. "),
    term("O", "the ray's starting point — drag it to move the ray", `(${fmt(s.rayOrigin.x, s)}, ${fmt(s.rayOrigin.y, s)}, ${fmt(s.rayOrigin.z, s)})`, "rayOrigin"),
    text(", "),
    term("d", "the ray's fixed direction vector", `(${fmt(s.rayDir.x, s)}, ${fmt(s.rayDir.y, s)}, ${fmt(s.rayDir.z, s)})`),
    text(", "),
    term("box", "the fixed axis-aligned box, from min to max corner", `(${fmt(s.aabbMin.x, s)}, ${fmt(s.aabbMin.y, s)}, ${fmt(s.aabbMin.z, s)}) → (${fmt(s.aabbMax.x, s)}, ${fmt(s.aabbMax.y, s)}, ${fmt(s.aabbMax.z, s)})`),
  ],
  "closest-point-aabb": (s) => [
    text("C = clamp(P, boxMin, boxMax); distance = ‖P − C‖. "),
    term("P", "the point being measured — drag it to move the point", `(${fmt(s.point.x, s)}, ${fmt(s.point.y, s)}, ${fmt(s.point.z, s)})`, "point"),
    text(", "),
    term("box", "the fixed axis-aligned box, from min to max corner", `(${fmt(s.aabbMin.x, s)}, ${fmt(s.aabbMin.y, s)}, ${fmt(s.aabbMin.z, s)}) → (${fmt(s.aabbMax.x, s)}, ${fmt(s.aabbMax.y, s)}, ${fmt(s.aabbMax.z, s)})`),
  ],
  "cartesian-transform": (s) => [
    text("X(u,v) = (1−u)(1−v)"),
    term("P₀₀", "the bottom-left grid corner", `(${fmt(s.transformP00.x, s)}, ${fmt(s.transformP00.y, s)})`, "transformP00"),
    text(" + u(1−v)"),
    term("P₁₀", "the bottom-right grid corner", `(${fmt(s.transformP10.x, s)}, ${fmt(s.transformP10.y, s)})`, "transformP10"),
    text(" + (1−u)v·"),
    term("P₀₁", "the top-left grid corner", `(${fmt(s.transformP01.x, s)}, ${fmt(s.transformP01.y, s)})`, "transformP01"),
    text(" + uv·"),
    term("P₁₁", "the top-right grid corner", `(${fmt(s.transformP11.x, s)}, ${fmt(s.transformP11.y, s)})`, "transformP11"),
    text(", where u, v ∈ [0,1] sweep across the fish outline's own reference coordinates."),
  ],
  "log-spiral-growth": (s) => [
    text("r(θ) = a·e^(bθ). "),
    term("a", "the spiral's radius at θ = 0 — drag S along its radius to resize", s.spiralResult ? fmt(s.spiralResult.a, s) : "—", "spiralStart"),
    text(", "),
    term("b", "the growth-rate constant — computed from how much the radius scales after one full turn", s.spiralResult ? fmt(s.spiralResult.b, s) : "—"),
    text(", "),
    term("θ", "the angle swept around the spiral, in radians", "0 → 2π×turns"),
  ],
  "cell-packing": (s) => [
    text("cell = ⋂ { x : (x − "),
    term("site", "the growth center this cell belongs to — drag it to move the cell", `(${fmt(s.cellCenter.x, s)}, ${fmt(s.cellCenter.y, s)})`, "cellCenter"),
    text(") · (neighbor − site) ≤ (‖neighbor‖² − ‖site‖²)/2 }, intersected over each of the 6 fixed ring neighbors."),
  ],
  "helical-shell-growth": (s) => [
    text("x,y,z(θ) = r·cosθ, r·sinθ, cθ; r = a·e^(bθ). "),
    term("a", "the base radius at θ = 0 — drag S to resize it", s.helixResult ? fmt(s.helixResult.a, s) : "—", "helixStart"),
    text(", "),
    term("b", "the growth-rate constant — computed from the radius after one turn", s.helixResult ? fmt(s.helixResult.b, s) : "—"),
    text(", "),
    term("c", "the rise per radian — drag T's height to change how fast the shell climbs", s.helixResult ? fmt(s.helixResult.c, s) : "—", "helixTurn"),
  ],
  "square-cube-law": (s) => [
    text("S = 4πr²; V = (4/3)πr³; S/V = 3/r. "),
    term("r", "the sphere's radius — drag R to resize it", s.magnitudeResult ? fmt(s.magnitudeResult.radius, s) : "—", "magnitudePoint"),
  ],
  "catenary-arch": (s) => [
    text("y(x) = a·(cosh(x/a) − 1); arc length = 2a·sinh(halfSpan/a). "),
    term("a", "the catenary parameter — smaller means a slacker, more sharply curved chain; drag A to change it", s.catenaryResult ? fmt(s.catenaryResult.a, s) : "—", "catenaryA"),
    text(", "),
    term("halfSpan", "half the fixed horizontal distance the chain hangs across", fmt(CATENARY_HALF_SPAN, s)),
  ],
  "allometric-growth": (s) => [
    text("y = x^k. "),
    term("x", "the whole body's size — drag X to grow or shrink it", s.allometryResult ? fmt(s.allometryResult.x, s) : "—", "allometrySize"),
    text(", "),
    term("k", "the allometric exponent — 1 is isometric growth; drag K to change how disproportionately the part grows", s.allometryResult ? fmt(s.allometryResult.k, s) : "—", "allometryExponent"),
  ],
  "phyllotaxis": (s) => [
    text("seed i sits at r = c√i, θ = i·δ. "),
    term("δ", "the divergence angle between successive seeds — drag D around the dial away from golden to see gaps and overlaps appear", s.phyllotaxisResult ? `${fmt(s.phyllotaxisResult.divergenceDeg, s)}°` : "—", "phyllotaxisDivergence"),
    text(", "),
    term("c", "a fixed scale constant controlling how quickly the spiral spreads out", "0.14"),
  ],
  "logistic-growth": (s) => [
    text("N(t) = K / (1 + e^(r(c−t))). "),
    term("K", "the ceiling the growth approaches — drag K's height to change it", s.logisticResult ? fmt(s.logisticResult.k, s) : "—", "logisticK"),
    text(", "),
    term("r", "the growth rate — drag R's distance from the origin to change it", s.logisticResult ? fmt(s.logisticResult.r, s) : "—", "logisticR"),
    text(", "),
    term("c", "the fixed inflection time, where growth is fastest", fmt(LOGISTIC_TIME_CENTER, s)),
  ],
  "geodesic-sphere": (s) => [
    text("V = 10f²+2, E = 30f², F = 20f² (f = detail+1); V − E + F = 2. "),
    term("f", "the subdivision frequency — drag F outward to subdivide the lattice further", s.geodesicResult ? String(s.geodesicResult.detail + 1) : "—", "geodesicDetail"),
  ],
  "whirling-squares": (s) => [
    text("side_i = side_0 / φ^i; arc length = (π/2)·Σ side_i. "),
    term("N", "how many squares are in the whirling sequence — drag N to add or remove squares", s.whirlingResult ? String(s.whirlingResult.count) : "—", "whirlingCount"),
    text(", "),
    term("φ", "the golden ratio, (1+√5)/2 — the one value that keeps every remaining rectangle similar to the last", fmt(PHI, s)),
  ],
  "catenoid": (s) => [
    text("r(z) = a·cosh(z/a); area = 2πa²·(H + sinh(2H)/2), H = h/a. "),
    term("a", "the waist radius — drag A to make the film wider and flatter, or narrower and more pinched", s.catenoidResult ? fmt(s.catenoidResult.a, s) : "—", "catenoidA"),
    text(", "),
    term("h", "half the fixed separation between the two rings the film spans", fmt(CATENOID_HALF_HEIGHT, s)),
  ],
  "milk-coronet": (s) => [
    text("perimeter = 2NR·sin(π/N); deficit = 2πR − perimeter ≈ π³R/(3N²). "),
    term("N", "the number of crown points — drag N to add or remove points from the splash", s.milkCoronetResult ? String(s.milkCoronetResult.points) : "—", "milkCount"),
    text(", "),
    term("R", "the rim radius — drag R to resize the crater", s.milkCoronetResult ? fmt(s.milkCoronetResult.radius, s) : "—", "milkRadius"),
  ],
  "egg-curve": (s) => [
    text("α = asin((R−r)/d); perimeter = (π−2α)r + (π+2α)R + 2√(d²−(R−r)²). "),
    term("R", "the round end's radius — drag R to resize it", s.eggCurveResult ? fmt(s.eggCurveResult.bigRadius, s) : "—", "eggBig"),
    text(", "),
    term("r", "the pointed end's radius — drag r to resize it", s.eggCurveResult ? fmt(s.eggCurveResult.smallRadius, s) : "—", "eggSmall"),
    text(", "),
    term("d", "the fixed distance between the two circles' centers", fmt(EGG_CENTER_DISTANCE, s)),
  ],
  "helicoid": (s) => [
    text("area = V·[(R/2)√(R²+c²) + (c²/2)·ln((R+√(R²+c²))/c)]. "),
    term("R", "the ribbon's radius — drag R to widen it", s.helicoidResult ? fmt(s.helicoidResult.radius, s) : "—", "helicoidRadius"),
    text(", "),
    term("c", "the rise per radian — drag P's height to change how tightly the ribbon twists", s.helicoidResult ? fmt(s.helicoidResult.c, s) : "—", "helicoidPitch"),
    text(", "),
    term("V", "the total sweep angle, fixed at 2.5 full turns", `${HELICOID_TURNS}×2π`),
  ],
  "bee-cell": (s) => [
    text("rhombus area = (√3/2)·√(1+4x²); total = 3H + 3(H−x) + 3·rhombus area. "),
    term("x", "how far the three alternating corners are trimmed, and the shared apex rises — drag X to change it", s.beeCellResult ? fmt(s.beeCellResult.x, s) : "—", "beeCellRise"),
    text(", "),
    term("H", "the fixed reference wall height used to compare total wax use", fmt(BEE_CELL_WALL_HEIGHT, s)),
  ],
};
