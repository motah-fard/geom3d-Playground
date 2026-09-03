"use client";

import { useState } from "react";
import { QUERY_META } from "@/lib/query-meta";
import { usePlaygroundStore, type ScenarioSnapshot } from "@/store/playground-store";
import type { Vec3 } from "@/types/geometry";
import { ApiInspector } from "@/components/ApiInspector";

function formatNumber(value: number, precision = 5) {
  if (!Number.isFinite(value)) return String(value);
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(precision)).toString();
}

function Coordinate({ label, value }: { label: string; value?: Vec3 }) {
  const { precision, unit } = usePlaygroundStore();
  if (!value) return null;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-xs text-slate-200">
        {(["x", "y", "z"] as const).map((axis) => (
          <span key={axis}><b className="mr-1 text-slate-600">{axis}</b>{formatNumber(value[axis], precision)}</span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-slate-600">Coordinates in {unit}</p>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const { precision, unit } = usePlaygroundStore();
  return (
    <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200/60">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-cyan-100">{formatNumber(value, precision)} <span className="text-xs font-medium text-cyan-200/50">{suffix ?? unit}</span></p>
    </div>
  );
}

type VectorKey = "point" | "rayOrigin" | "segmentA" | "segmentB" | "segmentA1" | "segmentA2" | "segmentB1" | "segmentB2" | "transformP00" | "transformP10" | "transformP01" | "transformP11" | "spiralStart" | "spiralTurn" | "cellCenter" | "helixStart" | "helixTurn" | "magnitudePoint" | "catenaryA" | "allometrySize" | "allometryExponent" | "phyllotaxisDivergence" | "logisticR" | "logisticK" | "geodesicDetail" | "whirlingCount" | "catenoidA";

function Comparison({ previous }: { previous: ScenarioSnapshot }) {
  const state = usePlaygroundStore();
  const fields: VectorKey[] = state.queryType === "project-point-to-plane" || state.queryType === "closest-point-aabb" ? ["point"] : state.queryType === "intersect-ray-plane" || state.queryType === "intersect-ray-aabb" ? ["rayOrigin"] : state.queryType === "closest-point-segment" ? ["point", "segmentA", "segmentB"] : state.queryType === "cartesian-transform" ? ["transformP00", "transformP10", "transformP01", "transformP11"] : state.queryType === "log-spiral-growth" ? ["spiralStart", "spiralTurn"] : state.queryType === "cell-packing" ? ["cellCenter"] : state.queryType === "helical-shell-growth" ? ["helixStart", "helixTurn"] : state.queryType === "square-cube-law" ? ["magnitudePoint"] : state.queryType === "catenary-arch" ? ["catenaryA"] : state.queryType === "allometric-growth" ? ["allometrySize", "allometryExponent"] : state.queryType === "phyllotaxis" ? ["phyllotaxisDivergence"] : state.queryType === "logistic-growth" ? ["logisticR", "logisticK"] : state.queryType === "geodesic-sphere" ? ["geodesicDetail"] : state.queryType === "whirling-squares" ? ["whirlingCount"] : state.queryType === "catenoid" ? ["catenoidA"] : ["segmentA1", "segmentA2", "segmentB1", "segmentB2"];
  return (
    <div className="rounded-xl border border-violet-300/15 bg-violet-300/[0.05] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-200/60">Change from previous state</p>
      <div className="mt-2 space-y-1.5">{fields.map((field) => {
        const current = state[field];
        const before = previous[field];
        return <div key={field} className="grid grid-cols-[1fr_repeat(3,auto)] gap-3 font-mono text-[10px] text-slate-400"><span className="text-violet-100">{state.objectLabels[field]}</span><span>Δx {formatNumber(current.x - before.x, state.precision)}</span><span>Δy {formatNumber(current.y - before.y, state.precision)}</span><span>Δz {formatNumber(current.z - before.z, state.precision)}</span></div>;
      })}</div>
    </div>
  );
}

export function ResultsPanel() {
  const state = usePlaygroundStore();
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const meta = QUERY_META[state.queryType];

  const activeResult =
    state.queryType === "project-point-to-plane" ? state.projectPointResult :
    state.queryType === "intersect-ray-plane" ? state.rayPlaneResult :
    state.queryType === "closest-point-segment" ? state.segmentResult :
    state.queryType === "segment-segment" ? state.segmentSegmentResult :
    state.queryType === "intersect-ray-aabb" ? state.rayAABBResult :
    state.queryType === "cartesian-transform" ? state.transformResult :
    state.queryType === "log-spiral-growth" ? state.spiralResult :
    state.queryType === "cell-packing" ? state.cellResult :
    state.queryType === "helical-shell-growth" ? state.helixResult :
    state.queryType === "square-cube-law" ? state.magnitudeResult :
    state.queryType === "catenary-arch" ? state.catenaryResult :
    state.queryType === "allometric-growth" ? state.allometryResult :
    state.queryType === "phyllotaxis" ? state.phyllotaxisResult :
    state.queryType === "logistic-growth" ? state.logisticResult :
    state.queryType === "geodesic-sphere" ? state.geodesicResult :
    state.queryType === "whirling-squares" ? state.whirlingResult :
    state.queryType === "catenoid" ? state.catenoidResult :
    state.closestPointAABBResult;

  const copy = async () => {
    if (!activeResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(activeResult, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const friendlyError = state.error?.toLowerCase().includes("fetch")
    ? "Can’t reach the geometry service. Check that the local API is running, then try again."
    : state.error;
  const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
  const formula = state.queryType === "project-point-to-plane"
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
                                ? "V = 10f²+2, E = 30f², F = 20f² (f = 2^detail); V − E + F = 2"
                                : state.queryType === "whirling-squares"
                                  ? "side_i = side_0 / φ^i; arc length = (π/2)·Σ side_i"
                                  : state.queryType === "catenoid"
                                    ? "r(z) = a·cosh(z/a); area = 2πa²·(H + sinh(2H)/2), H = h/a"
                                    : "C = clamp(P, boxMin, boxMax); distance = ‖P − C‖";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-2xl shadow-black/10" aria-labelledby="results-heading" aria-live="polite" aria-busy={state.queryStatus === "running"}>
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Output</p>
          <h2 id="results-heading" className="mt-0.5 text-base font-bold text-white">Result</h2>
        </div>
        {state.queryStatus === "running" && <span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">Updating</span>}
        {state.queryStatus === "success" && <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">Current</span>}
      </header>

      <div className="p-4">
        {friendlyError && (
          <div role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm leading-6 text-rose-100">
            <p className="font-bold">Unable to compute</p>
            <p className="mt-1 text-rose-200/80">{friendlyError}</p>
            <button type="button" onClick={() => state.loadExample(state.queryType)} className="mt-3 rounded-lg border border-rose-300/20 px-3 py-1.5 text-xs font-bold hover:bg-rose-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Retry example</button>
          </div>
        )}

        {!friendlyError && !activeResult && (
          <div className="py-7 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-slate-700 bg-slate-900 text-lg text-cyan-300">⌁</div>
            <p className="mt-3 text-sm font-semibold text-slate-200">Preparing the example</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{meta.description}</p>
          </div>
        )}

        {!friendlyError && activeResult && (
          <div className="space-y-3">
            {state.queryType === "project-point-to-plane" && state.projectPointResult && (
              <><Metric label="Perpendicular distance" value={state.projectPointResult.distance} /><Coordinate label="Projected point P′" value={state.projectPointResult.projectedPoint} /><p className="text-xs leading-5 text-slate-500">P′ lies on the plane along its normal from P.</p></>
            )}

            {state.queryType === "intersect-ray-plane" && state.rayPlaneResult && (
              state.rayPlaneResult.hit ? (
                <><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3"><p className="font-bold text-emerald-100">Intersection found</p><p className="mt-1 text-xs text-emerald-200/70">The ray reaches the plane at t = {formatNumber(state.rayPlaneResult.t, state.precision)}.</p></div><Coordinate label="Intersection point" value={state.rayPlaneResult.point} /></>
              ) : (
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3"><p className="font-bold text-amber-100">No forward intersection</p><p className="mt-1 text-xs leading-5 text-amber-200/70">The ray is parallel to the plane or the plane lies behind its direction.</p></div>
              )
            )}

            {state.queryType === "closest-point-segment" && state.segmentResult && (
              <><Metric label="Distance to segment" value={state.segmentResult.distance} /><Coordinate label="Closest point C" value={state.segmentResult.point} /></>
            )}

            {state.queryType === "segment-segment" && state.segmentSegmentResult && (
              <><Metric label={state.segmentSegmentResult.distance === 0 ? "Segments intersect" : "Shortest separation"} value={state.segmentSegmentResult.distance} /><Coordinate label="Closest point on A" value={state.segmentSegmentResult.pointA} /><Coordinate label="Closest point on B" value={state.segmentSegmentResult.pointB} /></>
            )}

            {state.queryType === "intersect-ray-aabb" && state.rayAABBResult && (
              state.rayAABBResult.hit ? (
                <><div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3"><p className="font-bold text-emerald-100">Box hit</p><p className="mt-1 text-xs text-emerald-200/70">Entry t = {formatNumber(state.rayAABBResult.tMin, state.precision)} · Exit t = {formatNumber(state.rayAABBResult.tMax, state.precision)}</p></div><Coordinate label="Entry point" value={state.rayAABBResult.point} /></>
              ) : (
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3"><p className="font-bold text-amber-100">Ray misses the box</p><p className="mt-1 text-xs leading-5 text-amber-200/70">Its forward path does not enter the box bounds.</p></div>
              )
            )}

            {state.queryType === "closest-point-aabb" && state.closestPointAABBResult && (
              <><Metric label={state.closestPointAABBResult.distance === 0 ? "Point is inside · distance" : "Distance to box"} value={state.closestPointAABBResult.distance} /><Coordinate label="Closest point C" value={state.closestPointAABBResult.point} /></>
            )}

            {state.queryType === "cartesian-transform" && state.transformResult && (
              <>
                <Metric label="Area ratio (warped ÷ reference)" value={state.transformResult.areaRatio} suffix="×" />
                <Metric label="Elongation (aspect ratio change)" value={state.transformResult.elongation} suffix="×" />
                <p className="text-xs leading-5 text-slate-500">A ratio above 1 means that region of the growth grid has expanded; below 1, it has been compressed — the same warp Thompson used to relate one species&rsquo; form to another.</p>
              </>
            )}

            {state.queryType === "log-spiral-growth" && state.spiralResult && (
              <>
                <Metric label="Growth ratio per whorl (turn)" value={state.spiralResult.growthRatio} suffix="×" />
                <Metric label="Equiangular pitch" value={state.spiralResult.pitchAngleDeg} suffix="°" />
                <p className="text-xs leading-5 text-slate-500">A pitch of 90° is a plain circle (no growth); the smaller the angle, the more rapidly the shell flares outward each turn — but it always crosses every radius at this same angle.</p>
              </>
            )}

            {state.queryType === "cell-packing" && state.cellResult && (
              <>
                <Metric label="Isoperimetric quotient (4πA ÷ P²)" value={state.cellResult.isoperimetricQuotient} suffix="" />
                <Metric label="Sides" value={state.cellResult.sides} suffix="" />
                <p className="text-xs leading-5 text-slate-500">A perfect circle scores 1; a regular hexagon scores ≈0.907. The centered cell sits at the hexagonal equilibrium — drag it away and the quotient drops as the cell becomes less efficient.</p>
              </>
            )}

            {state.queryType === "helical-shell-growth" && state.helixResult && (
              <>
                <Metric label="Growth ratio per whorl (turn)" value={state.helixResult.growthRatio} suffix="×" />
                <Metric label="Rise per whorl (turn)" value={state.helixResult.risePerTurn} />
                <Metric label="Equiangular pitch" value={state.helixResult.pitchAngleDeg} suffix="°" />
                <p className="text-xs leading-5 text-slate-500">Set the rise to 0 and this is exactly the flat nautilus-style spiral; raise it and the same widening pattern climbs into a turreted shell instead.</p>
              </>
            )}

            {state.queryType === "square-cube-law" && state.magnitudeResult && (
              <>
                <Metric label="Surface area" value={state.magnitudeResult.surfaceArea} suffix={`${state.unit}²`} />
                <Metric label="Volume" value={state.magnitudeResult.volume} suffix={`${state.unit}³`} />
                <Metric label="Surface ÷ volume" value={state.magnitudeResult.ratio} suffix={`${state.unit}⁻¹`} />
                <p className="text-xs leading-5 text-slate-500">Grow the sphere and this ratio falls as 1/r — the reason a scaled-up animal has relatively less surface (for breathing, cooling, absorbing) per unit of the volume it must support and feed.</p>
              </>
            )}

            {state.queryType === "catenary-arch" && state.catenaryResult && (
              <>
                <Metric label="Sag over the span" value={state.catenaryResult.sag} />
                <Metric label="Chain length needed" value={state.catenaryResult.arcLength} />
                <p className="text-xs leading-5 text-slate-500">This is the exact equilibrium shape of a chain hanging under its own weight — and, turned upside down, the ideal arch shape carrying pure compression with no bending at all.</p>
              </>
            )}

            {state.queryType === "allometric-growth" && state.allometryResult && (
              <>
                <Metric label="Part size (y = xᵏ)" value={state.allometryResult.y} />
                <Metric label="Part ÷ body ratio" value={state.allometryResult.ratio} suffix="×" />
                <p className="text-xs leading-5 text-slate-500">At k = 1 this ratio stays constant as the body grows — the same shape at every size. Away from k = 1, the part claims a changing share of the whole as size increases.</p>
              </>
            )}

            {state.queryType === "phyllotaxis" && state.phyllotaxisResult && (
              <>
                <Metric label="Divergence angle" value={state.phyllotaxisResult.divergenceDeg} suffix="°" />
                <Metric label="Deviation from golden (137.508°)" value={state.phyllotaxisResult.deviationDeg} suffix="°" />
                <p className="text-xs leading-5 text-slate-500">At exactly the golden angle the seeds pack with no gaps and no visible spiral arms — drag even slightly away from it and the arms snap into view, because nearby angles are well approximated by simple fractions.</p>
              </>
            )}

            {state.queryType === "logistic-growth" && state.logisticResult && (
              <>
                <Metric label="Value at the inflection (t = 6)" value={state.logisticResult.k / 2} />
                <Metric label="Maximum growth rate (rK/4)" value={state.logisticResult.maxGrowthRate} />
                <p className="text-xs leading-5 text-slate-500">Growth is slow at first, fastest exactly halfway to the ceiling, then slows again as it approaches K — the S-curve shape of almost all real growth over time.</p>
              </>
            )}

            {state.queryType === "geodesic-sphere" && state.geodesicResult && (
              <>
                <Metric label="Vertices" value={state.geodesicResult.vertices} />
                <Metric label="Edges" value={state.geodesicResult.edges} />
                <Metric label="Faces" value={state.geodesicResult.faces} />
                <Metric label="Euler characteristic (V − E + F)" value={state.geodesicResult.eulerCharacteristic} />
                <p className="text-xs leading-5 text-slate-500">No matter how finely the lattice is subdivided, V − E + F always equals 2 — a topological fact true of any sphere-like mesh, not just this construction.</p>
              </>
            )}

            {state.queryType === "whirling-squares" && state.whirlingResult && (
              <>
                <Metric label="Squares" value={state.whirlingResult.count} suffix="" />
                <Metric label="Shrink ratio per square (φ)" value={state.whirlingResult.ratio} suffix="×" />
                <Metric label="Approximating spiral arc length" value={state.whirlingResult.totalArcLength} />
                <p className="text-xs leading-5 text-slate-500">Only the golden ratio makes every remaining rectangle exactly similar to the last — the property that lets this discrete construction approximate a true equiangular spiral.</p>
              </>
            )}

            {state.queryType === "catenoid" && state.catenoidResult && (
              <>
                <Metric label="Rim radius" value={state.catenoidResult.rimRadius} />
                <Metric label="Film surface area" value={state.catenoidResult.surfaceArea} suffix={`${state.unit}²`} />
                <p className="text-xs leading-5 text-slate-500">Of every surface spanning these two rings, this exact shape has the least area — which is precisely why a real soap film settles into it.</p>
              </>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Calculation</p>
              <code className="mt-2 block whitespace-normal font-mono text-[11px] leading-5 text-slate-400">{formula}</code>
            </div>
            {state.past.length > 0 && (
              <div>
                <button type="button" aria-pressed={showComparison} onClick={() => setShowComparison((value) => !value)} className="text-xs font-semibold text-violet-300 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">{showComparison ? "Hide comparison" : "Compare with previous"}</button>
                {showComparison && <div className="mt-2"><Comparison previous={state.past[state.past.length - 1]} /></div>}
              </div>
            )}

            <details className="group border-t border-slate-800 pt-3">
              <summary className="cursor-pointer list-none text-xs font-semibold text-slate-500 hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Developer details <span aria-hidden="true">⌄</span></summary>
              <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-5 text-slate-400">{JSON.stringify(activeResult, null, 2)}</pre>
              <button type="button" onClick={copy} className="mt-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{copied ? "Copied ✓" : "Copy JSON"}</button>
              <div className="mt-4 border-t border-slate-800 pt-3"><ApiInspector /></div>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}
