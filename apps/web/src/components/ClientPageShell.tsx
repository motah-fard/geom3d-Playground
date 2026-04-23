"use client";

import { IntersectRayPlaneForm } from "@/components/IntersectRayPlaneForm";
import { ProjectPointToPlaneForm } from "@/components/ProjectPointToPlaneForm";
import { QuerySelector } from "@/components/QuerySelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SceneCanvas } from "@/components/SceneCanvas";
import { usePlaygroundStore } from "@/store/playground-store";

export function ClientPageShell() {
  const { queryType } = usePlaygroundStore();

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">geom3d Playground</h1>
          <p className="mt-2 text-neutral-600">
            An interactive 3D geometry lab for practical queries and spatial reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr_320px]">
          <section>
            <QuerySelector />
            {queryType === "project-point-to-plane" ? (
              <ProjectPointToPlaneForm />
            ) : (
              <IntersectRayPlaneForm />
            )}
          </section>

          <section>
            <SceneCanvas />
          </section>

          <section>
            <ResultsPanel />
          </section>
        </div>
      </div>
    </main>
  );
}