"use client";

import { IntersectRayPlaneForm } from "@/components/IntersectRayPlaneForm";
import { ProjectPointToPlaneForm } from "@/components/ProjectPointToPlaneForm";
import { ClosestPointSegmentForm } from "@/components/ClosestPointSegmentForm";
import { QuerySelector } from "@/components/QuerySelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SceneCanvas } from "@/components/scene/SceneCanvas";
import { usePlaygroundStore } from "@/store/playground-store";

export function ClientPageShell() {
  const { queryType, loadExample } = usePlaygroundStore();

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">geom3d Playground</h1>
          <p className="mt-2 text-neutral-600">
            An interactive 3D geometry lab for practical queries and spatial reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr_320px]">
          
          {/* LEFT PANEL */}
          <section className="space-y-4">
            <QuerySelector />

            {/* Show examples ONLY for ray-plane */}
            {queryType === "intersect-ray-plane" && (
              <div className="flex gap-2">
                <button
                  onClick={() => loadExample("ray-plane-hit")}
                  className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  Example: Hit
                </button>

                <button
                  onClick={() => loadExample("ray-plane-miss")}
                  className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
                >
                  Example: Miss
                </button>
              </div>
            )}

            {/* FORMS */}
            {queryType === "project-point-to-plane" && (
              <ProjectPointToPlaneForm />
            )}

            {queryType === "intersect-ray-plane" && (
              <IntersectRayPlaneForm />
            )}

            {queryType === "closest-point-segment" && (
              <ClosestPointSegmentForm />
            )}
          </section>

          {/* SCENE */}
          <section>
            <SceneCanvas />
          </section>

          {/* RESULTS */}
          <section>
            <ResultsPanel />
          </section>

        </div>
      </div>
    </main>
  );
}