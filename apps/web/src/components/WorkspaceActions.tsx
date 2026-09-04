"use client";

import { useEffect, useMemo, useState } from "react";
import { getScenarioSnapshot, type ScenarioSnapshot, usePlaygroundStore } from "@/store/playground-store";
import { trackInteraction } from "@/lib/analytics";
import { UsageInsights } from "@/components/UsageInsights";

const STORAGE_KEY = "geom3d-playground-scenario-v1";

function encodeScenario(snapshot: ScenarioSnapshot) {
  const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
  return btoa(String.fromCharCode(...bytes));
}

function decodeScenario(value: string): ScenarioSnapshot {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as ScenarioSnapshot;
}

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function WorkspaceActions() {
  const store = usePlaygroundStore();
  const [notice, setNotice] = useState("");
  const objectIds = useMemo(() => {
    if (store.queryType === "project-point-to-plane" || store.queryType === "closest-point-aabb") return ["point"];
    if (store.queryType === "intersect-ray-plane" || store.queryType === "intersect-ray-aabb") return ["rayOrigin"];
    if (store.queryType === "closest-point-segment") return ["point", "segmentA", "segmentB"];
    if (store.queryType === "cartesian-transform") return ["transformP00", "transformP10", "transformP01", "transformP11"];
    if (store.queryType === "log-spiral-growth") return ["spiralStart", "spiralTurn"];
    if (store.queryType === "cell-packing") return ["cellCenter"];
    if (store.queryType === "helical-shell-growth") return ["helixStart", "helixTurn"];
    if (store.queryType === "square-cube-law") return ["magnitudePoint"];
    if (store.queryType === "catenary-arch") return ["catenaryA"];
    if (store.queryType === "allometric-growth") return ["allometrySize", "allometryExponent"];
    if (store.queryType === "phyllotaxis") return ["phyllotaxisDivergence"];
    if (store.queryType === "logistic-growth") return ["logisticR", "logisticK"];
    if (store.queryType === "geodesic-sphere") return ["geodesicDetail"];
    if (store.queryType === "whirling-squares") return ["whirlingCount"];
    if (store.queryType === "catenoid") return ["catenoidA"];
    if (store.queryType === "milk-coronet") return ["milkRadius", "milkCount"];
    if (store.queryType === "egg-curve") return ["eggBig", "eggSmall"];
    if (store.queryType === "helicoid") return ["helicoidRadius", "helicoidPitch"];
    if (store.queryType === "bee-cell") return ["beeCellRise"];
    if (store.queryType === "angles") return ["angleRayB"];
    if (store.queryType === "pythagorean-theorem") return ["pythagoreanLegA", "pythagoreanLegB"];
    if (store.queryType === "right-triangle-trig") return ["trigAngle"];
    if (store.queryType === "circle-measures") return ["circleRadius", "circleAngle"];
    if (store.queryType === "regular-polygon") return ["polygonSides", "polygonRadius"];
    if (store.queryType === "transformations") return ["transformTranslation", "transformHandle"];
    return ["segmentA1", "segmentA2", "segmentB1", "segmentB2"];
  }, [store.queryType]);

  useEffect(() => {
    document.documentElement.dataset.theme = store.theme;
    localStorage.setItem("geom3d-theme", store.theme);
  }, [store.theme]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("geom3d-theme");
    if (savedTheme === "light" || savedTheme === "dark") usePlaygroundStore.getState().setTheme(savedTheme);
    const encoded = new URL(window.location.href).searchParams.get("scenario");
    if (!encoded) return;
    try {
      usePlaygroundStore.getState().hydrateScenario(decodeScenario(encoded));
    } catch {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };
  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getScenarioSnapshot()));
    showNotice("Scenario saved locally");
    trackInteraction("scenario_saved");
  };
  const load = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return showNotice("No saved scenario yet");
    try {
      store.hydrateScenario(JSON.parse(saved) as ScenarioSnapshot);
      showNotice("Saved scenario loaded");
      trackInteraction("scenario_loaded");
    } catch { showNotice("Saved scenario is invalid"); }
  };
  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("scenario", encodeScenario(getScenarioSnapshot()));
    window.history.replaceState({}, "", url);
    try {
      await navigator.clipboard.writeText(url.toString());
      showNotice("Share link copied");
      trackInteraction("scenario_shared");
    } catch {
      showNotice("Share link is ready in the address bar");
    }
  };
  const exportJson = () => {
    download("geom3d-scenario.json", new Blob([JSON.stringify(getScenarioSnapshot(), null, 2)], { type: "application/json" }));
    showNotice("Scenario exported");
    trackInteraction("json_exported");
  };
  const exportPng = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return showNotice("Viewport is not ready");
    canvas.toBlob((blob) => {
      if (!blob) return showNotice("Could not capture viewport");
      download("geom3d-viewport.png", blob);
      showNotice("Viewport exported");
      trackInteraction("png_exported");
    }, "image/png");
  };

  const actionClass = "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 border-b border-white/5 px-4 py-3 sm:px-6" aria-label="Workspace actions">
      <button type="button" onClick={store.undo} disabled={!store.past.length} className={actionClass}>↶ Undo</button>
      <button type="button" onClick={store.redo} disabled={!store.future.length} className={actionClass}>↷ Redo</button>
      <span className="mx-1 h-6 w-px bg-slate-800" aria-hidden="true" />
      <button type="button" onClick={save} className={actionClass}>Save</button>
      <button type="button" onClick={load} className={actionClass}>Load</button>
      <button type="button" onClick={share} className={actionClass}>Share link</button>
      <button type="button" onClick={exportJson} className={actionClass}>Export JSON</button>
      <button type="button" onClick={exportPng} className={actionClass}>Export PNG</button>
      <details className="relative ml-auto">
        <summary className={`${actionClass} cursor-pointer list-none`}>Workspace settings</summary>
        <div className="absolute right-0 z-30 mt-2 w-[min(340px,calc(100vw-2rem))] space-y-4 rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="text-xs text-slate-400">Units<select value={store.unit} onChange={(event) => store.setUnit(event.target.value as ScenarioSnapshot["unit"])} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white"><option value="units">units</option><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option></select></label>
            <label className="text-xs text-slate-400">Precision<input type="number" min="0" max="8" value={store.precision} onChange={(event) => store.setPrecision(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white" /></label>
            <label className="text-xs text-slate-400">Theme<select value={store.theme} onChange={(event) => store.setTheme(event.target.value as "dark" | "light")} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white"><option value="dark">Dark</option><option value="light">Light</option></select></label>
            <label className="text-xs text-slate-400">Snap<input type="number" min="0" max="10" step="0.1" value={store.snap} onChange={(event) => store.setSnap(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white" /></label>
          </div>
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Object labels</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {objectIds.map((id) => <label key={id} className="text-xs text-slate-400">{id}<input value={store.objectLabels[id] ?? ""} onChange={(event) => store.setObjectLabel(id, event.target.value)} maxLength={8} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 font-mono text-white" /></label>)}
            </div>
          </fieldset>
          <UsageInsights />
        </div>
      </details>
      <span className="sr-only" role="status" aria-live="polite">{notice}</span>
      {notice && <span className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-cyan-300/20 bg-slate-950 px-4 py-2 text-xs font-bold text-cyan-100 shadow-2xl">{notice}</span>}
    </div>
  );
}
