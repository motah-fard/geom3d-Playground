"use client";

import Image from "next/image";
import { usePlaygroundStore } from "@/store/playground-store";

const MODES = [
  { id: "learn", label: "Learn" },
  { id: "explore", label: "Explore" },
  { id: "build", label: "Playground" },
] as const;

export function TopNav() {
  const { appMode, setAppMode, queryStatus } = usePlaygroundStore();

  return (
    <header className="border-b border-white/5 bg-slate-950/45 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-mark.png" alt="geom3d" width={40} height={40} className="h-10 w-10 object-contain" priority />
          <div>
            <h1 className="text-base font-bold tracking-tight sm:text-lg">geom3d</h1>
            <p className="hidden text-xs text-slate-500 sm:block">Don&rsquo;t just see geometry. Change it.</p>
          </div>
        </div>

        <nav className="flex rounded-xl border border-slate-800 bg-slate-950/60 p-1 text-sm font-semibold" role="tablist" aria-label="App mode">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={appMode === mode.id}
              onClick={() => setAppMode(mode.id)}
              className={`rounded-lg px-4 py-1.5 transition ${appMode === mode.id ? "bg-primary/15 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              {mode.label}
            </button>
          ))}
        </nav>

        {appMode === "build" && (
          <div className="flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400" role="status" aria-live="polite">
            <span className={`h-2 w-2 rounded-full ${queryStatus === "running" ? "animate-pulse bg-amber-300" : queryStatus === "error" ? "bg-rose-400" : "bg-emerald-400"}`} />
            {queryStatus === "running" ? "Computing" : queryStatus === "error" ? "Needs attention" : "Ready"}
          </div>
        )}
      </div>
    </header>
  );
}
