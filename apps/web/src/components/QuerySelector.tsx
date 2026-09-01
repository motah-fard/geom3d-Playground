"use client";

import { QUERY_GROUPS, QUERY_META } from "@/lib/query-meta";
import { usePlaygroundStore } from "@/store/playground-store";
import type { QueryType } from "@/types/geometry";
import { trackInteraction } from "@/lib/analytics";

export function QuerySelector() {
  const { queryType, setQueryType, setShouldAutoRun, saveCheckpoint } = usePlaygroundStore();
  const selectQuery = (query: QueryType) => {
    saveCheckpoint();
    trackInteraction("query_changed", { query });
    setQueryType(query);
    setShouldAutoRun(true);
  };

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
      <nav aria-label="Geometry queries" className="hidden space-y-5 xl:block">
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
    </>
  );
}
