"use client";

import { useSyncExternalStore } from "react";
import { getLatestApiTrace, subscribeApiTrace } from "@/lib/api";

export function ApiInspector() {
  const trace = useSyncExternalStore(subscribeApiTrace, getLatestApiTrace, () => null);
  if (!trace) return <p className="text-xs text-slate-600">The API verification request will appear after a query runs.</p>;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <code className="truncate text-cyan-200/70">POST {trace.path}</code>
        <span className={trace.status === "success" ? "text-emerald-300" : trace.status === "error" ? "text-rose-300" : "text-amber-300"}>{trace.status}{trace.durationMs ? ` · ${Math.round(trace.durationMs)}ms` : ""}</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Request</p>
      <pre className="max-h-48 overflow-auto rounded-lg bg-black/30 p-2 font-mono text-[10px] leading-4 text-slate-500">{JSON.stringify(trace.request, null, 2)}</pre>
      {trace.response !== undefined && <><p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Verified response</p><pre className="max-h-48 overflow-auto rounded-lg bg-black/30 p-2 font-mono text-[10px] leading-4 text-slate-500">{JSON.stringify(trace.response, null, 2)}</pre></>}
    </div>
  );
}
