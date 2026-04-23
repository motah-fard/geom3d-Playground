"use client";

import { usePlaygroundStore } from "@/store/playground-store";

export function ResultsPanel() {
  const { queryType, result, rayPlaneResult, error } = usePlaygroundStore();

  return (
    <div className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Results</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!error && queryType === "project-point-to-plane" && !result && (
        <p className="text-sm text-neutral-500">
          Run a projection query to see the projected point and distance.
        </p>
      )}

      {!error && queryType === "intersect-ray-plane" && !rayPlaneResult && (
        <p className="text-sm text-neutral-500">
          Run a ray-plane intersection query to see whether the ray hits the plane.
        </p>
      )}

      {queryType === "project-point-to-plane" && result && (
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium">Projected Point</div>
            <pre className="mt-1 rounded bg-neutral-100 p-3">
              {JSON.stringify(result.projectedPoint, null, 2)}
            </pre>
          </div>

          <div>
            <div className="font-medium">Distance</div>
            <p>{result.distance}</p>
          </div>
        </div>
      )}

      {queryType === "intersect-ray-plane" && rayPlaneResult && (
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium">Hit</div>
            <p>{rayPlaneResult.hit ? "true" : "false"}</p>
          </div>

          <div>
            <div className="font-medium">Intersection Point</div>
            <pre className="mt-1 rounded bg-neutral-100 p-3">
              {JSON.stringify(rayPlaneResult.point, null, 2)}
            </pre>
          </div>

          <div>
            <div className="font-medium">t</div>
            <p>{rayPlaneResult.t}</p>
          </div>
        </div>
      )}
    </div>
  );
}