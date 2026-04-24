"use client";

import { usePlaygroundStore } from "@/store/playground-store";

export function ResultsPanel() {
  const {
    queryType,
    projectPointResult,
    rayPlaneResult,
    segmentResult,
    segmentSegmentResult,
    error,
  } = usePlaygroundStore();

  const copy = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Results</h2>

      {/* 🔴 Error */}
      {error && (
        <div className="mb-3 rounded bg-red-100 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ======================= */}
      {/* 🟡 EMPTY STATES */}
      {/* ======================= */}

      {!error &&
        queryType === "project-point-to-plane" &&
        !projectPointResult && (
          <p className="text-sm text-neutral-500">
            Run a projection query to see the projected point and distance.
          </p>
        )}

      {!error &&
        queryType === "intersect-ray-plane" &&
        !rayPlaneResult && (
          <p className="text-sm text-neutral-500">
            Run a ray-plane intersection query.
          </p>
        )}

      {!error &&
        queryType === "closest-point-segment" &&
        !segmentResult && (
          <p className="text-sm text-neutral-500">
            Run a closest point query.
          </p>
        )}

      {!error &&
        queryType === "segment-segment" &&
        !segmentSegmentResult && (
          <p className="text-sm text-neutral-500">
            Run a segment-segment distance query.
          </p>
        )}

      {/* ======================= */}
      {/* 🟢 PROJECT POINT */}
      {/* ======================= */}

      {!error &&
        queryType === "project-point-to-plane" &&
        projectPointResult && (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Projected Point</div>
              <pre className="mt-1 rounded bg-neutral-100 p-3">
                {JSON.stringify(projectPointResult.projectedPoint, null, 2)}
              </pre>
            </div>

            <div>
              <div className="font-medium">Distance</div>
              <p>{projectPointResult.distance}</p>
            </div>

            <div className="text-xs text-neutral-500">
              distance = |(P − planePoint) · normal|
            </div>

            <button
              onClick={() => copy(projectPointResult)}
              className="text-xs text-blue-600 hover:underline"
            >
              Copy JSON
            </button>
          </div>
        )}

      {/* ======================= */}
      {/* 🔵 RAY-PLANE */}
      {/* ======================= */}

      {!error &&
        queryType === "intersect-ray-plane" &&
        rayPlaneResult && (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Hit</div>
              <p>{rayPlaneResult.hit ? "true" : "false"}</p>
            </div>

            {rayPlaneResult.hit && (
              <>
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

                <button
                  onClick={() => copy(rayPlaneResult)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Copy JSON
                </button>
              </>
            )}
          </div>
        )}

      {/* ======================= */}
      {/* 🟣 POINT → SEGMENT */}
      {/* ======================= */}

      {!error &&
        queryType === "closest-point-segment" &&
        segmentResult && (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Closest Point</div>
              <pre className="mt-1 rounded bg-neutral-100 p-3">
                {JSON.stringify(segmentResult.point, null, 2)}
              </pre>
            </div>

            <div>
              <div className="font-medium">Distance</div>
              <p>{segmentResult.distance}</p>
            </div>

            <button
              onClick={() => copy(segmentResult)}
              className="text-xs text-blue-600 hover:underline"
            >
              Copy JSON
            </button>
          </div>
        )}

      {/* ======================= */}
      {/* 🔶 SEGMENT ↔ SEGMENT */}
      {/* ======================= */}

      {!error &&
        queryType === "segment-segment" &&
        segmentSegmentResult && (
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Point A</div>
              <pre className="mt-1 rounded bg-neutral-100 p-3">
                {JSON.stringify(segmentSegmentResult.pointA, null, 2)}
              </pre>
            </div>

            <div>
              <div className="font-medium">Point B</div>
              <pre className="mt-1 rounded bg-neutral-100 p-3">
                {JSON.stringify(segmentSegmentResult.pointB, null, 2)}
              </pre>
            </div>

            <div>
              <div className="font-medium">Distance</div>
              <p>{segmentSegmentResult.distance}</p>
            </div>

            <div className="text-xs text-neutral-500">
              distance = ||P₁ - P₂|| (shortest distance between segments)
            </div>

            <button
              onClick={() => copy(segmentSegmentResult)}
              className="text-xs text-blue-600 hover:underline"
            >
              Copy JSON
            </button>
          </div>
        )}
    </div>
  );
}