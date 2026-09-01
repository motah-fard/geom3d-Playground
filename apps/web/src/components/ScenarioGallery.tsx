"use client";

import { usePlaygroundStore, type ExampleType } from "@/store/playground-store";
import { trackInteraction } from "@/lib/analytics";

const scenarios: { type: ExampleType; name: string; detail: string }[] = [
  { type: "ray-plane-miss", name: "Parallel ray", detail: "No plane intersection" },
  { type: "ray-box-miss", name: "Box miss", detail: "Ray passes above bounds" },
  { type: "intersecting-segments", name: "Crossing segments", detail: "Zero separation" },
  { type: "degenerate-segment", name: "Collapsed segment", detail: "Both endpoints coincide" },
  { type: "point-inside-box", name: "Point inside box", detail: "Zero box distance" },
];

export function ScenarioGallery() {
  const loadExample = usePlaygroundStore((state) => state.loadExample);
  return (
    <details className="mt-5 border-t border-slate-800 pt-4">
      <summary className="cursor-pointer list-none px-2 text-xs font-bold text-slate-400 hover:text-white">Edge-case gallery <span aria-hidden="true">⌄</span></summary>
      <div className="mt-2 space-y-1">
        {scenarios.map((scenario) => (
          <button key={scenario.type} type="button" onClick={() => { trackInteraction("preset_loaded", { preset: scenario.type }); loadExample(scenario.type); }} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            <span className="block text-xs font-semibold text-slate-300">{scenario.name}</span>
            <span className="block text-[10px] text-slate-600">{scenario.detail}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
