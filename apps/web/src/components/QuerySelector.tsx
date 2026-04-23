"use client";

import { usePlaygroundStore } from "@/store/playground-store";

export function QuerySelector() {
  const { queryType, setQueryType } = usePlaygroundStore();

  return (
    <div className="mb-4 rounded-2xl border p-3">
      <label className="mb-2 block text-sm font-medium">Query</label>
      <select
        value={queryType}
        onChange={(e) =>
          setQueryType(e.target.value as "project-point-to-plane" | "intersect-ray-plane")
        }
        className="w-full rounded border px-3 py-2"
      >
        <option value="project-point-to-plane">Project Point to Plane</option>
        <option value="intersect-ray-plane">Intersect Ray with Plane</option>
      </select>
    </div>
  );
}