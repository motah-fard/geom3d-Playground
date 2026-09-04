"use client";

import { AnglesForm } from "@/components/AnglesForm";
import { PythagoreanForm } from "@/components/PythagoreanForm";
import { RightTriangleTrigForm } from "@/components/RightTriangleTrigForm";
import { CircleMeasuresForm } from "@/components/CircleMeasuresForm";
import { RegularPolygonForm } from "@/components/RegularPolygonForm";
import { TransformationsForm } from "@/components/TransformationsForm";
import { SolidsForm } from "@/components/SolidsForm";
import { CrossSectionForm } from "@/components/CrossSectionForm";
import { NetForm } from "@/components/NetForm";
import { IntersectRayPlaneForm } from "@/components/IntersectRayPlaneForm";
import { ProjectPointToPlaneForm } from "@/components/ProjectPointToPlaneForm";
import { ClosestPointSegmentForm } from "@/components/ClosestPointSegmentForm";
import { SegmentSegmentForm } from "@/components/SegmentSegmentForm";
import { IntersectRayAABBForm } from "@/components/IntersectRayAABBForm";
import { ClosestPointAABBForm } from "@/components/ClosestPointAABBForm";
import { CartesianTransformForm } from "@/components/CartesianTransformForm";
import { LogSpiralForm } from "@/components/LogSpiralForm";
import { CellPackingForm } from "@/components/CellPackingForm";
import { HelicalShellForm } from "@/components/HelicalShellForm";
import { SquareCubeLawForm } from "@/components/SquareCubeLawForm";
import { CatenaryForm } from "@/components/CatenaryForm";
import { AllometricGrowthForm } from "@/components/AllometricGrowthForm";
import { PhyllotaxisForm } from "@/components/PhyllotaxisForm";
import { LogisticGrowthForm } from "@/components/LogisticGrowthForm";
import { GeodesicSphereForm } from "@/components/GeodesicSphereForm";
import { WhirlingSquaresForm } from "@/components/WhirlingSquaresForm";
import { CatenoidForm } from "@/components/CatenoidForm";
import { MilkCoronetForm } from "@/components/MilkCoronetForm";
import { EggCurveForm } from "@/components/EggCurveForm";
import { HelicoidForm } from "@/components/HelicoidForm";
import { BeeCellForm } from "@/components/BeeCellForm";

import { ResultsPanel } from "@/components/ResultsPanel";
import { SceneCanvas } from "@/components/scene/SceneCanvas";
import { usePlaygroundStore } from "@/store/playground-store";
import { LEARNING_PATH, QUERY_META } from "@/lib/query-meta";
import { ChapterMathView } from "@/components/ChapterMathView";
import { ChapterCodeView } from "@/components/ChapterCodeView";
import { NATURE_EXAMPLES } from "@/lib/nature-examples";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ComprehensionCheck } from "@/components/ComprehensionCheck";
import { TryItChallenge } from "@/components/TryItChallenge";
import { COMPREHENSION_QUESTIONS } from "@/lib/comprehension-questions";

// The 3D scene, formula/code views, geometry inputs, and progress UI for
// whichever chapter is active — shared by the Build workspace's 3-column
// grid (with the sidebar/ResultsPanel it already provides) and Learn/
// Explore's single-column chapter page (which has no sidebar, so it needs
// its own inline results and a way back to that mode's home screen).
export function ChapterView({ showSidebarResults, onBack }: { showSidebarResults: boolean; onBack?: () => void }) {
  const { queryType, loadExample, setQueryType, setShouldAutoRun, saveCheckpoint, correctAnswerQueries, contentMode, setContentMode } = usePlaygroundStore();
  const meta = QUERY_META[queryType];
  const pathIndex = LEARNING_PATH.indexOf(queryType);
  const previousQuery = pathIndex > 0 ? LEARNING_PATH[pathIndex - 1] : null;
  const nextQuery = pathIndex >= 0 && pathIndex < LEARNING_PATH.length - 1 ? LEARNING_PATH[pathIndex + 1] : null;
  const missingPrerequisites = (meta.prerequisites ?? []).filter((prereq) => !correctAnswerQueries.includes(prereq));
  const goTo = (query: typeof queryType) => {
    saveCheckpoint();
    setQueryType(query);
    setShouldAutoRun(true);
  };

  const form = (
    <>
      {queryType === "angles" && <AnglesForm />}
      {queryType === "pythagorean-theorem" && <PythagoreanForm />}
      {queryType === "right-triangle-trig" && <RightTriangleTrigForm />}
      {queryType === "circle-measures" && <CircleMeasuresForm />}
      {queryType === "regular-polygon" && <RegularPolygonForm />}
      {queryType === "transformations" && <TransformationsForm />}
      {queryType === "solids-3d" && <SolidsForm />}
      {queryType === "cross-sections" && <CrossSectionForm />}
      {queryType === "nets" && <NetForm />}
      {queryType === "project-point-to-plane" && <ProjectPointToPlaneForm />}
      {queryType === "intersect-ray-plane" && <IntersectRayPlaneForm />}
      {queryType === "closest-point-segment" && <ClosestPointSegmentForm />}
      {queryType === "segment-segment" && <SegmentSegmentForm />}
      {queryType === "intersect-ray-aabb" && <IntersectRayAABBForm />}
      {queryType === "closest-point-aabb" && <ClosestPointAABBForm />}
      {queryType === "cartesian-transform" && <CartesianTransformForm />}
      {queryType === "log-spiral-growth" && <LogSpiralForm />}
      {queryType === "cell-packing" && <CellPackingForm />}
      {queryType === "helical-shell-growth" && <HelicalShellForm />}
      {queryType === "square-cube-law" && <SquareCubeLawForm />}
      {queryType === "catenary-arch" && <CatenaryForm />}
      {queryType === "allometric-growth" && <AllometricGrowthForm />}
      {queryType === "phyllotaxis" && <PhyllotaxisForm />}
      {queryType === "logistic-growth" && <LogisticGrowthForm />}
      {queryType === "geodesic-sphere" && <GeodesicSphereForm />}
      {queryType === "whirling-squares" && <WhirlingSquaresForm />}
      {queryType === "catenoid" && <CatenoidForm />}
      {queryType === "milk-coronet" && <MilkCoronetForm />}
      {queryType === "egg-curve" && <EggCurveForm />}
      {queryType === "helicoid" && <HelicoidForm />}
      {queryType === "bee-cell" && <BeeCellForm />}
    </>
  );

  return (
    <section className="min-w-0 space-y-4" aria-labelledby="query-title">
      {onBack && (
        <button type="button" onClick={onBack} className="text-xs font-semibold text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          ← Back
        </button>
      )}
      <div className="rounded-2xl -mx-1 px-1 py-2" style={{ background: `radial-gradient(ellipse at top left, ${meta.accent}14, transparent 70%)` }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: meta.accent }}>{meta.category}</p>
              <DifficultyBadge difficulty={meta.difficulty} />
            </div>
            <h2 id="query-title" className="mt-1 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {meta.emoji && <span aria-hidden="true">{meta.emoji}</span>}
              {meta.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{meta.description}</p>
            {NATURE_EXAMPLES[queryType] && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                <span className="font-semibold" style={{ color: meta.accent }}>
                  {meta.category === "Project" || meta.category === "Intersect" || meta.category === "Measure" ? "Why it matters: " : "Seen in nature: "}
                </span>
                {NATURE_EXAMPLES[queryType]}
              </p>
            )}
            {missingPrerequisites.length > 0 && (
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                Recommended first:{" "}
                {missingPrerequisites.map((prereq, i) => (
                  <span key={prereq}>
                    {i > 0 && ", "}
                    <button type="button" onClick={() => goTo(prereq)} className="font-semibold text-slate-300 underline decoration-slate-600 underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                      {QUERY_META[prereq].shortTitle}
                    </button>
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {queryType === "intersect-ray-plane" && (
              <button type="button" onClick={() => loadExample("ray-plane-miss")} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Parallel miss</button>
            )}
            <button type="button" onClick={() => loadExample(queryType)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">Reset example</button>
          </div>
        </div>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 p-1 text-xs font-semibold" role="tablist" aria-label="Chapter view">
        {(["visual", "math", "code"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={contentMode === mode}
            onClick={() => setContentMode(mode)}
            className={`flex-1 rounded-lg px-3 py-1.5 capitalize transition ${contentMode === mode ? "bg-primary/15 text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {contentMode === "visual" && (
        <>
          <SceneCanvas />
          <div className={showSidebarResults ? "xl:hidden" : ""}><ResultsPanel /></div>

          <details open className="group rounded-2xl border border-slate-800 bg-slate-950/55">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300">
              <span>Geometry inputs</span>
              <span className="text-slate-500 transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <div className="border-t border-slate-800 p-4">{form}</div>
          </details>
        </>
      )}
      {contentMode === "math" && <ChapterMathView />}
      {contentMode === "code" && <ChapterCodeView />}

      <TryItChallenge chapterKey={queryType} />
      <ComprehensionCheck question={COMPREHENSION_QUESTIONS[queryType]} chapterKey={queryType} />

      {(previousQuery || nextQuery) && (
        <nav className="flex items-center justify-between gap-3" aria-label="Guided path navigation">
          {previousQuery ? (
            <button type="button" onClick={() => goTo(previousQuery)} className="min-w-0 flex-1 truncate rounded-xl border border-slate-800 bg-slate-950/55 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">← Previous</span>
              <span className="font-semibold">{QUERY_META[previousQuery].shortTitle}</span>
            </button>
          ) : <span />}
          {nextQuery ? (
            <button type="button" onClick={() => goTo(nextQuery)} className="min-w-0 flex-1 truncate rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-right text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-300/70">Next →</span>
              <span className="font-semibold">{QUERY_META[nextQuery].shortTitle}</span>
            </button>
          ) : <span />}
        </nav>
      )}
    </section>
  );
}
