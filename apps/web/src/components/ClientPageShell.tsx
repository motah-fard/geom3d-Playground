"use client";

import Image from "next/image";
import { AnglesForm } from "@/components/AnglesForm";
import { PythagoreanForm } from "@/components/PythagoreanForm";
import { RightTriangleTrigForm } from "@/components/RightTriangleTrigForm";
import { CircleMeasuresForm } from "@/components/CircleMeasuresForm";
import { RegularPolygonForm } from "@/components/RegularPolygonForm";
import { TransformationsForm } from "@/components/TransformationsForm";
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

import { QuerySelector } from "@/components/QuerySelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SceneCanvas } from "@/components/scene/SceneCanvas";
import { usePlaygroundStore } from "@/store/playground-store";
import { LEARNING_PATH, QUERY_META } from "@/lib/query-meta";
import { WorkspaceActions } from "@/components/WorkspaceActions";
import { ScenarioGallery } from "@/components/ScenarioGallery";
import { GlossaryPanel } from "@/components/GlossaryPanel";
import { IntroSection } from "@/components/IntroSection";
import { NATURE_EXAMPLES } from "@/lib/nature-examples";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ComprehensionCheck } from "@/components/ComprehensionCheck";
import { COMPREHENSION_QUESTIONS } from "@/lib/comprehension-questions";

export function ClientPageShell() {
  const { queryType, loadExample, queryStatus, setQueryType, setShouldAutoRun, saveCheckpoint } = usePlaygroundStore();
  const meta = QUERY_META[queryType];
  const pathIndex = LEARNING_PATH.indexOf(queryType);
  const previousQuery = pathIndex > 0 ? LEARNING_PATH[pathIndex - 1] : null;
  const nextQuery = pathIndex >= 0 && pathIndex < LEARNING_PATH.length - 1 ? LEARNING_PATH[pathIndex + 1] : null;
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#102535_0,#071018_38%,#050b11_100%)] text-slate-100">
      <a href="#workspace" className="sr-only z-50 rounded bg-cyan-300 px-4 py-2 text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to workspace</a>
      <header className="border-b border-white/5 bg-slate-950/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.png" alt="geom3d" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">geom3d Playground</h1>
              <p className="hidden text-xs text-slate-500 sm:block">Interactive spatial reasoning lab</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400" role="status" aria-live="polite">
            <span className={`h-2 w-2 rounded-full ${queryStatus === "running" ? "animate-pulse bg-amber-300" : queryStatus === "error" ? "bg-rose-400" : "bg-emerald-400"}`} />
            {queryStatus === "running" ? "Computing" : queryStatus === "error" ? "Needs attention" : "Ready"}
          </div>
        </div>
      </header>

      <WorkspaceActions />
      <IntroSection />

      <div id="workspace" className="mx-auto grid max-w-[1600px] gap-4 p-4 sm:p-6 xl:grid-cols-[250px_minmax(0,1fr)_340px]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 shadow-2xl shadow-black/10 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-y-auto" aria-label="Query navigation">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-white">Choose a query</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Objects persist across compatible tools. Reset when you want a fresh example.</p>
          </div>
          <QuerySelector />
          <ScenarioGallery />
          <GlossaryPanel />
        </aside>

        <section className="min-w-0 space-y-4" aria-labelledby="query-title">
          <div className="px-1">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300/80">{meta.category}</p>
                  <DifficultyBadge difficulty={meta.difficulty} />
                </div>
                <h2 id="query-title" className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{meta.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{meta.description}</p>
                {NATURE_EXAMPLES[queryType] && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-200/80">
                    <span className="font-semibold text-emerald-300">Seen in nature: </span>
                    {NATURE_EXAMPLES[queryType]}
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

          <SceneCanvas />
          <div className="xl:hidden"><ResultsPanel /></div>

          <details open className="group rounded-2xl border border-slate-800 bg-slate-950/55">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300">
              <span>Geometry inputs</span>
              <span className="text-slate-500 transition group-open:rotate-180" aria-hidden="true">⌄</span>
            </summary>
            <div className="border-t border-slate-800 p-4">{form}</div>
          </details>

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

        <aside className="hidden xl:block" aria-label="Query results">
          <div className="sticky top-6"><ResultsPanel /></div>
        </aside>
      </div>
    </main>
  );
}
