"use client";

import { useState } from "react";
import { LEARNING_PATH, QUERY_GROUPS, QUERY_META } from "@/lib/query-meta";
import { usePlaygroundStore } from "@/store/playground-store";
import type { QueryType } from "@/types/geometry";
import { trackInteraction } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/DifficultyBadge";

export function QuerySelector() {
  const { queryType, setQueryType, setShouldAutoRun, saveCheckpoint, visitedQueries, correctAnswerQueries, points, streak } = usePlaygroundStore();
  const [mode, setMode] = useState<"path" | "browse">("path");
  const [search, setSearch] = useState("");
  const selectQuery = (query: QueryType) => {
    saveCheckpoint();
    trackInteraction("query_changed", { query });
    setQueryType(query);
    setShouldAutoRun(true);
  };

  const visitedCount = LEARNING_PATH.filter((query) => visitedQueries.includes(query)).length;
  // "Learned" (answered its comprehension check correctly at least once) is a
  // stronger signal than merely "visited" — used to drive the guided path's
  // three-state icons and the continue-learning shortcut.
  const nextToLearn = LEARNING_PATH.find((query) => !correctAnswerQueries.includes(query));

  const trimmedSearch = search.trim().toLowerCase();
  const searchResults = trimmedSearch
    ? LEARNING_PATH.filter((query) => {
        const meta = QUERY_META[query];
        return `${meta.title} ${meta.shortTitle} ${meta.description}`.toLowerCase().includes(trimmedSearch);
      })
    : [];

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
        <label className="mb-3 block">
          <span className="sr-only">Search chapters</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chapters…"
            className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        {trimmedSearch ? (
          <nav aria-label="Search results" className="space-y-1">
            {searchResults.length === 0 && (
              <p className="px-2 py-1 text-xs text-slate-500">No chapters match &ldquo;{search.trim()}&rdquo;.</p>
            )}
            {searchResults.map((query) => {
              const meta = QUERY_META[query];
              const active = queryType === query;
              return (
                <button
                  key={query}
                  type="button"
                  onClick={() => selectQuery(query)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-primary/50 bg-primary/15 text-white shadow-[0_0_10px_-2px_var(--color-primary-glow)]" : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"}`}
                >
                  {meta.emoji && <span aria-hidden="true">{meta.emoji}</span>}
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{meta.shortTitle}</span>
                  <DifficultyBadge difficulty={meta.difficulty} className="shrink-0" />
                </button>
              );
            })}
          </nav>
        ) : (
          <>
            <div className="mb-3 flex rounded-xl border border-slate-800 bg-slate-950/60 p-1 text-xs font-semibold" role="tablist" aria-label="Navigation mode">
              <button type="button" role="tab" aria-selected={mode === "path"} onClick={() => setMode("path")} className={`flex-1 rounded-lg px-2 py-1.5 transition ${mode === "path" ? "bg-primary/15 text-white" : "text-slate-500 hover:text-slate-300"}`}>Guided path</button>
              <button type="button" role="tab" aria-selected={mode === "browse"} onClick={() => setMode("browse")} className={`flex-1 rounded-lg px-2 py-1.5 transition ${mode === "browse" ? "bg-primary/15 text-white" : "text-slate-500 hover:text-slate-300"}`}>Browse by category</button>
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
              <div className="mt-2.5 flex items-center gap-3 text-xs font-bold">
                <span className="inline-flex items-center gap-1 text-amber-300">⭐ {points} pts</span>
                {streak > 0 && <span className="inline-flex items-center gap-1 text-orange-400">🔥 {streak} streak</span>}
              </div>
              {nextToLearn && (
                <button
                  type="button"
                  onClick={() => selectQuery(nextToLearn)}
                  className="mt-2.5 flex w-full items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <span>Continue: {QUERY_META[nextToLearn].shortTitle}</span>
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
            <nav aria-label="Guided learning path" className="space-y-1">
              {LEARNING_PATH.map((query, index) => {
                const meta = QUERY_META[query];
                const active = queryType === query;
                const learned = correctAnswerQueries.includes(query);
                const inProgress = !learned && visitedQueries.includes(query);
                return (
                  <button
                    key={query}
                    type="button"
                    onClick={() => selectQuery(query)}
                    aria-current={active ? "page" : undefined}
                    className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-primary/50 bg-primary/15 text-white shadow-[0_0_10px_-2px_var(--color-primary-glow)]" : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"}`}
                  >
                    <span
                      title={learned ? "Learned" : inProgress ? "In progress" : "Not started"}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${learned ? "bg-emerald-400/20 text-emerald-300" : inProgress ? "bg-amber-400/20 text-amber-300" : "bg-slate-800 text-slate-500"}`}
                    >
                      {index + 1}
                    </span>
                    {meta.emoji && <span aria-hidden="true">{meta.emoji}</span>}
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{meta.shortTitle}</span>
                    <span aria-hidden="true" className={learned ? "text-emerald-300" : inProgress ? "text-amber-300" : "text-slate-600"}>
                      {learned ? "✓" : inProgress ? "◉" : "○"}
                    </span>
                    <DifficultyBadge difficulty={meta.difficulty} className="shrink-0" />
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {mode === "browse" && (
          <nav aria-label="Geometry queries" className="space-y-5">
            {QUERY_GROUPS.map(({ category, queries }) => {
              const learnedCount = queries.filter((query) => correctAnswerQueries.includes(query)).length;
              return (
              <div key={category}>
                <div className="mb-1.5 flex items-center justify-between px-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{category}</h2>
                  <span className="text-[10px] font-semibold text-slate-500">{learnedCount} / {queries.length}</span>
                </div>
                <div className="mb-2 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(learnedCount / queries.length) * 100}%`, backgroundColor: QUERY_META[queries[0]].accent }} />
                </div>
                <div className="space-y-1">
                  {queries.map((query) => {
                    const meta = QUERY_META[query];
                    const active = queryType === query;
                    const learned = correctAnswerQueries.includes(query);
                    return (
                      <button
                        key={query}
                        type="button"
                        onClick={() => {
                          selectQuery(query);
                        }}
                        aria-current={active ? "page" : undefined}
                        className={`group w-full rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? "border-primary/50 bg-primary/15 text-white shadow-[0_0_10px_-2px_var(--color-primary-glow)]" : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"}`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.accent }} aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{meta.shortTitle}</span>
                          <span aria-hidden="true" className={learned ? "text-emerald-300" : "text-slate-600"}>{learned ? "✓" : "○"}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </nav>
        )}
          </>
        )}
      </div>
    </>
  );
}
