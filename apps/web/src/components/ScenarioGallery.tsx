"use client";

import { usePlaygroundStore, type ExampleType } from "@/store/playground-store";
import { trackInteraction } from "@/lib/analytics";

const baseScenarios: { type: ExampleType; name: string; detail: string }[] = [
  { type: "ray-plane-miss", name: "Miss the plane", detail: "Send the ray parallel to it — no intersection at all" },
  { type: "ray-box-miss", name: "Miss the box", detail: "Send the ray clean over the bounds" },
  { type: "intersecting-segments", name: "Cross two segments", detail: "Zero separation — they actually touch" },
  { type: "degenerate-segment", name: "Collapse a segment", detail: "Both endpoints coincide — is it still a segment?" },
  { type: "point-inside-box", name: "Put the point inside", detail: "Zero distance — it's already inside the box" },
];

const growthScenarios: { type: ExampleType; name: string; detail: string }[] = [
  { type: "cartesian-extreme-stretch", name: "Stretch the grid", detail: "Pull one corner far out and watch the warp" },
  { type: "log-spiral-near-circle", name: "Flatten the spiral", detail: "Growth ratio near 1 — barely a spiral at all" },
  { type: "cell-off-center", name: "Push the cell off-center", detail: "Watch the isoperimetric quotient drop" },
  { type: "helical-flat-nautilus", name: "Flatten a shell", detail: "Zero rise per turn — a flat nautilus" },
  { type: "square-cube-elephant", name: "Scale up to elephant-size", detail: "Watch the surface-to-volume ratio collapse" },
  { type: "catenary-slack-rope", name: "Slacken the rope", detail: "Deep sag from a small a" },
  { type: "allometric-hyper", name: "Force hyperallometric growth", detail: "k = 3, like antler growth" },
  { type: "phyllotaxis-simple-fraction", name: "Break the golden angle", detail: "Set the divergence to 120° — obvious gaps and arms" },
  { type: "logistic-fast-grower", name: "Speed up the growth", detail: "Push the growth rate r higher" },
  { type: "geodesic-coarse", name: "Coarsen the lattice", detail: "Detail level 0 — just the bare icosahedron" },
  { type: "whirling-just-three", name: "Stop the spiral early", detail: "Just three squares — barely begun" },
  { type: "catenoid-pinched-neck", name: "Pinch the catenoid", detail: "What happens as the waist approaches zero?" },
  { type: "milk-coronet-triangle", name: "Shrink the crown", detail: "Only 3 splash points" },
  { type: "egg-sharply-pointed", name: "Sharpen the egg", detail: "Round end far larger than the pointed end" },
  { type: "helicoid-tight-screw", name: "Tighten the screw", detail: "Small rise per turn" },
  { type: "bee-cell-flat-lid", name: "Barely trim the cell", detail: "Compare to the wax-minimizing optimum" },
];

export function ScenarioGallery() {
  const loadExample = usePlaygroundStore((state) => state.loadExample);
  const renderButton = (scenario: (typeof baseScenarios)[number]) => (
    <button key={scenario.type} type="button" onClick={() => { trackInteraction("preset_loaded", { preset: scenario.type }); loadExample(scenario.type); }} className="group flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-slate-300">{scenario.name}</span>
        <span className="block text-[10px] text-slate-600">{scenario.detail}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-slate-600 transition group-hover:text-cyan-300">→</span>
    </button>
  );
  return (
    <details className="mt-5 border-t border-slate-800 pt-4">
      <summary className="cursor-pointer list-none px-2 text-xs font-bold text-slate-400 hover:text-white">Experiments <span aria-hidden="true">⌄</span></summary>
      <p className="px-2 pt-1 text-[10px] leading-4 text-slate-600">Push the mathematics beyond its normal parameters and see what breaks, or what it approaches.</p>
      <div className="mt-2 space-y-1">
        <p className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Base geometry</p>
        {baseScenarios.map(renderButton)}
        <p className="px-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">Growth &amp; form</p>
        {growthScenarios.map(renderButton)}
      </div>
    </details>
  );
}
