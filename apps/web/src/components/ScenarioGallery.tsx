"use client";

import { usePlaygroundStore, type ExampleType } from "@/store/playground-store";
import { trackInteraction } from "@/lib/analytics";

const baseScenarios: { type: ExampleType; name: string; detail: string }[] = [
  { type: "ray-plane-miss", name: "Parallel ray", detail: "No plane intersection" },
  { type: "ray-box-miss", name: "Box miss", detail: "Ray passes above bounds" },
  { type: "intersecting-segments", name: "Crossing segments", detail: "Zero separation" },
  { type: "degenerate-segment", name: "Collapsed segment", detail: "Both endpoints coincide" },
  { type: "point-inside-box", name: "Point inside box", detail: "Zero box distance" },
];

const growthScenarios: { type: ExampleType; name: string; detail: string }[] = [
  { type: "cartesian-extreme-stretch", name: "Extreme stretch", detail: "One corner pulled far out" },
  { type: "log-spiral-near-circle", name: "Near-circle spiral", detail: "Growth ratio close to 1" },
  { type: "cell-off-center", name: "Off-center cell", detail: "Lower isoperimetric quotient" },
  { type: "helical-flat-nautilus", name: "Flat nautilus", detail: "Zero rise per turn" },
  { type: "square-cube-elephant", name: "Elephant-scale", detail: "Low surface-to-volume ratio" },
  { type: "catenary-slack-rope", name: "Slack rope", detail: "Deep sag, small a" },
  { type: "allometric-hyper", name: "Hyperallometric growth", detail: "k = 3, like antler growth" },
  { type: "phyllotaxis-simple-fraction", name: "Simple-fraction angle", detail: "120° — obvious gaps and arms" },
  { type: "logistic-fast-grower", name: "Fast grower", detail: "High growth rate r" },
  { type: "geodesic-coarse", name: "Coarse icosahedron", detail: "Detail level 0" },
  { type: "whirling-just-three", name: "Just three squares", detail: "The spiral barely begun" },
  { type: "catenoid-pinched-neck", name: "Pinched neck", detail: "Small waist, narrow film" },
  { type: "milk-coronet-triangle", name: "Triangle crown", detail: "Only 3 splash points" },
  { type: "egg-sharply-pointed", name: "Sharply pointed egg", detail: "Round end far larger than pointed end" },
  { type: "helicoid-tight-screw", name: "Tight screw", detail: "Small rise per turn" },
  { type: "bee-cell-flat-lid", name: "Flat lid", detail: "Barely trimmed — compare to the optimum" },
];

export function ScenarioGallery() {
  const loadExample = usePlaygroundStore((state) => state.loadExample);
  const renderButton = (scenario: (typeof baseScenarios)[number]) => (
    <button key={scenario.type} type="button" onClick={() => { trackInteraction("preset_loaded", { preset: scenario.type }); loadExample(scenario.type); }} className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
      <span className="block text-xs font-semibold text-slate-300">{scenario.name}</span>
      <span className="block text-[10px] text-slate-600">{scenario.detail}</span>
    </button>
  );
  return (
    <details className="mt-5 border-t border-slate-800 pt-4">
      <summary className="cursor-pointer list-none px-2 text-xs font-bold text-slate-400 hover:text-white">Edge-case gallery <span aria-hidden="true">⌄</span></summary>
      <div className="mt-2 space-y-1">
        <p className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">Base geometry</p>
        {baseScenarios.map(renderButton)}
        <p className="px-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">Growth &amp; form</p>
        {growthScenarios.map(renderButton)}
      </div>
    </details>
  );
}
