import type { PlaygroundState } from "@/store/playground-store";
import type { Vec3 } from "@/types/geometry";
import { formatNumber } from "@/lib/format";

// A plain-text fallback formula for chapters that don't have an
// interactive, hoverable FormulaDisplay in FORMULA_BUILDERS — used by both
// ResultsPanel's "Calculation" block and the Math tab.
export function plainFormulaText(state: PlaygroundState): string {
  const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
  return state.queryType === "project-point-to-plane"
    ? `d = |(P − Q) · n̂| = ${state.projectPointResult ? formatNumber(state.projectPointResult.distance, state.precision) : "—"}`
    : state.queryType === "intersect-ray-plane"
      ? `t = ((Q − O) · n) / (d · n); d · n = ${formatNumber(dot(state.rayDir, state.planeNormal), state.precision)}`
      : state.queryType === "closest-point-segment"
        ? "t = clamp(((P − A) · (B − A)) / ‖B − A‖², 0, 1)"
        : state.queryType === "segment-segment"
          ? "minimize ‖(A₁ + s·u) − (B₁ + t·v)‖ for s,t ∈ [0,1]"
          : state.queryType === "intersect-ray-aabb"
            ? "intersect the X, Y, and Z ray slabs; hit when tEntry ≤ tExit"
            : state.queryType === "cartesian-transform"
              ? "X(u,v) = (1−u)(1−v)P₀₀ + u(1−v)P₁₀ + (1−u)v·P₀₁ + uv·P₁₁"
              : state.queryType === "log-spiral-growth"
                ? `r(θ) = a·e^(bθ); a = ${state.spiralResult ? formatNumber(state.spiralResult.a, state.precision) : "—"}, b = ${state.spiralResult ? formatNumber(state.spiralResult.b, state.precision) : "—"}`
                : state.queryType === "cell-packing"
                  ? "cell = ⋂ { x : (x − site)·(neighbor − site) ≤ (‖neighbor‖² − ‖site‖²)/2 }"
                  : state.queryType === "helical-shell-growth"
                    ? `x,y,z(θ) = r·cos θ, r·sin θ, cθ; r = a·e^(bθ); a = ${state.helixResult ? formatNumber(state.helixResult.a, state.precision) : "—"}, b = ${state.helixResult ? formatNumber(state.helixResult.b, state.precision) : "—"}`
                    : state.queryType === "square-cube-law"
                      ? "S = 4πr²; V = (4/3)πr³; S/V = 3/r"
                      : state.queryType === "catenary-arch"
                        ? "y(x) = a·(cosh(x/a) − 1); arc length = 2a·sinh(halfSpan/a)"
                        : state.queryType === "allometric-growth"
                          ? "y = x^k (k = 1 is isometric growth)"
                          : state.queryType === "phyllotaxis"
                            ? "seed i: r = c√i, θ = i·δ (δ = divergence angle)"
                            : state.queryType === "logistic-growth"
                              ? "N(t) = K / (1 + e^(r(c−t))); max growth rate = rK/4 at N = K/2"
                              : state.queryType === "geodesic-sphere"
                                ? "V = 10f²+2, E = 30f², F = 20f² (f = detail+1); V − E + F = 2"
                                : state.queryType === "whirling-squares"
                                  ? "side_i = side_0 / φ^i; arc length = (π/2)·Σ side_i"
                                  : state.queryType === "catenoid"
                                    ? "r(z) = a·cosh(z/a); area = 2πa²·(H + sinh(2H)/2), H = h/a"
                                    : state.queryType === "milk-coronet"
                                      ? `perimeter = 2NR·sin(π/N); deficit = 2πR − perimeter ≈ π³R/(3N²)`
                                      : state.queryType === "egg-curve"
                                        ? "α = asin((R−r)/d); perimeter = (π−2α)r + (π+2α)R + 2√(d²−(R−r)²)"
                                        : state.queryType === "helicoid"
                                          ? "area = V·[(R/2)√(R²+c²) + (c²/2)·ln((R+√(R²+c²))/c)]"
                                          : state.queryType === "bee-cell"
                                            ? "rhombus area = (√3/2)·√(1+4x²); total = 3H + 3(H−x) + 3·rhombus area"
                                            : state.queryType === "angles"
                                              ? "angle = atan2(B.y, B.x); complement = 90° − angle; supplement = 180° − angle"
                                              : state.queryType === "pythagorean-theorem"
                                                ? "c = √(a² + b²)"
                                                : state.queryType === "right-triangle-trig"
                                                  ? "sin θ = opposite/hypotenuse; cos θ = adjacent/hypotenuse; tan θ = opposite/adjacent"
                                                  : state.queryType === "circle-measures"
                                                    ? "C = 2πr; A = πr²; arc length = rθ; sector area = (1/2)r²θ"
                                                    : state.queryType === "regular-polygon"
                                                      ? "perimeter = 2NR·sin(π/N); area = (1/2)NR²·sin(2π/N)"
                                                      : state.queryType === "transformations"
                                                        ? "P′ = R(θ)·(s·P) + T — scale by s, rotate by θ, then translate by T"
                                                        : state.queryType === "solids-3d"
                                                          ? "volume and surface area depend on the chosen solid — see the hoverable terms below"
                                                          : state.queryType === "cross-sections"
                                                            ? "x² + (1 − tan²α·m²)y² − 2tan²α·m·c·y − tan²α·c² = 0, m = tan(tilt)"
                                                            : state.queryType === "nets"
                                                              ? "fold angle = t·90°, t ∈ [0, 1]"
                                                              : "C = clamp(P, boxMin, boxMax); distance = ‖P − C‖";
}
