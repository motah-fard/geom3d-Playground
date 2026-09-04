"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/glossary";

export function GlossaryPanel() {
  const [query, setQuery] = useState("");
  const filtered = GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(query.toLowerCase()) ||
      entry.definition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <details className="mt-5 border-t border-slate-800 pt-4">
      <summary className="cursor-pointer list-none px-2 text-xs font-bold text-slate-400 hover:text-white">Glossary <span aria-hidden="true">⌄</span></summary>
      <div className="mt-2 px-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search terms…"
          aria-label="Search the glossary"
          className="mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-xs text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        />
        <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {filtered.map((entry) => (
            <div key={entry.term}>
              <p className="text-xs font-bold text-slate-200">{entry.term}</p>
              <p className="text-[11px] leading-4 text-slate-500">{entry.definition}</p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-xs text-slate-600">No terms match &ldquo;{query}&rdquo;.</p>}
        </div>
      </div>
    </details>
  );
}
