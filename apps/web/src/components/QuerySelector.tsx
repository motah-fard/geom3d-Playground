"use client";

import { useState } from "react";
import { LEARNING_PATH, QUERY_GROUPS, QUERY_META } from "@/lib/query-meta";
import { usePlaygroundStore } from "@/store/playground-store";
import type { QueryType } from "@/types/geometry";
import { trackInteraction } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/DifficultyBadge";

export function QuerySelector() {
  const { queryType, setQueryType, setShouldAutoRun, saveCheckpoint, visitedQueries } = usePlaygroundStore();
  const [mode, setMode] = useState<"path" | "browse">("path");
  const selectQuery = (query: QueryType) => {
    saveCheckpoint();
    trackInteraction("query_changed", { query });
    setQueryType(query);
    setShouldAutoRun(true);
  };

  const visitedCount = LEARNING_PATH.filter((query) => visitedQueries.includes(query)).length;

  return (
    <>
      <label className="block xl:hidden">
        <span className="sr-only">Select geometry query</span>
        <select
          value={queryType}
          onChange={(event) => {
            const query = event.target.value as QueryType;
            selectQuery(query);
          }}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        >
          {QUERY_GROUPS.map(({ category, queries }) => (
            <optgroup key={category} label={category}>
              {queries.map((query) => (
                <option key={query} value={query}>{QUERY_META[query].title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="hidden xl:block">
        <div className="mb-3 flex rounded-xl border border-slate-800 bg-slate-950/60 p-1 text-xs font-semibold" role="tablist" aria-label="Navigation mode">
          <button type="button" role="tab" aria-selected={mode === "path"} onClick={() => setMode("path")} className={`flex-1 rounded-lg px-2 py-1.5 transition ${mode === "path" ? "bg-cyan-400/15 text-cyan-100" : "text-slate-500 hover:text-slate-300"}`}>Guided path</button>
          <button type="button" role="tab" aria-selected={mode === "browse"} onClick={() => setMode("browse")} className={`flex-1 rounded-lg px-2 py-1.5 transition ${mode === "browse" ? "bg-cyan-400/15 text-cyan-100" : "text-slate-500 hover:text-slate-300"}`}>Browse by category</button>
        </div>

        {mode === "path" && (
          <>
            <div className="mb-3 px-2">
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Progress</span>
                <span>{visitedCount} / {LEARNING_PATH.length} explored</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${(visitedCount / LEARNING_PATH.length) * 100}%` }} />
              </div>
            </div>
            <nav aria-label="Guided learning path" className="space-y-1">
              {LEARNING_PATH.map((query, index) => {
                const meta = QUERY_META[query];
                const active = queryType === query;
                const visited = visitedQueries.includes(query);
                return (
                  <button
                    key={query}
                    type="button"
                    onClick={() => selectQuery(query)}
                    aria-current={active ? "page" : undefined}
                    className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-cyan-400/30 bg-cyan-400/10 text-white" : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${visited ? "bg-emerald-400/20 text-emerald-300" : "bg-slate-800 text-slate-500"}`}>
                      {visited ? "✓" : index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{meta.shortTitle}</span>
                    <DifficultyBadge difficulty={meta.difficulty} className="shrink-0" />
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {mode === "browse" && (
          <nav aria-label="Geometry queries" className="space-y-5">
            {QUERY_GROUPS.map(({ category, queries }) => (
              <div key={category}>
                <h2 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{category}</h2>
                <div className="space-y-1">
                  {queries.map((query) => {
                    const meta = QUERY_META[query];
                    const active = queryType === query;
                    return (
                      <button
                        key={query}
                        type="button"
                        onClick={() => {
                          selectQuery(query);
                        }}
                        aria-current={active ? "page" : undefined}
                        className={`group w-full rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-cyan-400/30 bg-cyan-400/10 text-white" : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.accent }} aria-hidden="true" />
                          <span className="text-sm font-semibold">{meta.shortTitle}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
