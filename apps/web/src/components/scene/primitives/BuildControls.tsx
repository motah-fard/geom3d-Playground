"use client";

import type { BuildSpeed } from "@/hooks/useBuildAnimation";

const SPEEDS: BuildSpeed[] = [0.5, 1, 2];

export function BuildControls({
  label,
  playing,
  progress,
  onPlayPause,
  onReset,
  onScrub,
  speed,
  onSpeedChange,
}: {
  label: string;
  playing: boolean;
  progress: number;
  onPlayPause: () => void;
  onReset: () => void;
  onScrub?: (progress: number) => void;
  speed: BuildSpeed;
  onSpeedChange: (speed: BuildSpeed) => void;
}) {
  return (
    <div className="pointer-events-auto flex min-w-[220px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-[10px] font-semibold text-slate-300 backdrop-blur">
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset"
        className="shrink-0 rounded-md px-2 py-1 text-slate-200 transition hover:bg-slate-800"
      >
        ⟲
      </button>
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={playing ? "Pause" : "Play"}
        className="shrink-0 rounded-md px-2 py-1 text-slate-200 transition hover:bg-slate-800"
      >
        {playing ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={progress}
        onChange={(event) => onScrub?.(Number(event.target.value))}
        disabled={!onScrub}
        className="h-1 flex-1 accent-[#F3B95F] disabled:opacity-40"
        aria-label={label}
      />
      <div className="flex shrink-0 overflow-hidden rounded-md border border-slate-800">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={speed === s}
            onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-1 transition ${speed === s ? "bg-primary/25 text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
