"use client";

import { useEffect } from "react";
import { usePlaygroundStore } from "@/store/playground-store";

export function NetForm() {
  const { netFold, shouldAutoRun, setNetInput, setShouldAutoRun, saveCheckpoint, objectLabels } = usePlaygroundStore();

  // Unlike every other chapter's form, this one has no submit step to
  // hang an auto-run off of — populate the result on mount and whenever
  // something else (a preset, undo/redo) sets shouldAutoRun.
  useEffect(() => {
    if (!shouldAutoRun) return;
    setNetInput(usePlaygroundStore.getState().netFold);
    setShouldAutoRun(false);
  }, [shouldAutoRun, setNetInput, setShouldAutoRun]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-700 px-1.5 font-mono text-[11px] text-white">{objectLabels.netFold}</span>
          Fold amount
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={netFold.x}
          onPointerDown={saveCheckpoint}
          onChange={(event) => {
            setNetInput({ x: Number(event.target.value), y: 0, z: 0 });
            setShouldAutoRun(true);
          }}
          className="w-full accent-pink-400"
        />
      </label>
      <p className="text-xs leading-5 text-slate-500">0 is the fully flat net; 1 is the closed cube. Drag the slider — or the pink handle in the scene — to fold and unfold it.</p>
    </div>
  );
}
