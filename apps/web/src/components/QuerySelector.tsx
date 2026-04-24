"use client";

import { usePlaygroundStore } from "@/store/playground-store";

export function QuerySelector() {
  const { queryType, setQueryType } = usePlaygroundStore();

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium">
        Select Query
      </label>

      <select
        value={queryType}
        onChange={(e) =>
          setQueryType(e.target.value as any)
        }
        className="w-full rounded border px-3 py-2"
      >
        <option value="project-point-to-plane">
          Point → Plane Projection
        </option>

        <option value="intersect-ray-plane">
          Ray → Plane Intersection
        </option>

        <option value="closest-point-segment">
          Closest Point → Segment
        </option>

        <option value="segment-segment">
          Segment ↔ Segment Distance
        </option>
      </select>
    </div>
  );
}