"use client";

import { useSyncExternalStore } from "react";
import { clearInteractions, getInteractions, subscribeInteractions } from "@/lib/analytics";

const EMPTY_EVENTS: ReturnType<typeof getInteractions> = [];

export function UsageInsights() {
  const events = useSyncExternalStore(subscribeInteractions, getInteractions, () => EMPTY_EVENTS);
  const counts = events.reduce<Record<string, number>>((result, event) => ({ ...result, [event.name]: (result[event.name] ?? 0) + 1 }), {});
  return (
    <div className="border-t border-slate-800 pt-3">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-bold text-slate-400">Local usability insights</p><p className="mt-0.5 text-[10px] text-slate-600">Stored only in this browser; nothing is transmitted.</p></div>
        <button type="button" onClick={clearInteractions} className="text-[10px] font-semibold text-slate-500 hover:text-white">Clear</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {Object.entries(counts).length ? Object.entries(counts).map(([name, count]) => <span key={name} className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] text-slate-400">{name.replaceAll("_", " ")} · {count}</span>) : <span className="text-[10px] text-slate-600">Insights appear as you explore.</span>}
      </div>
    </div>
  );
}
