"use client";

import { usePlaygroundStore } from "@/store/playground-store";
import { QUERY_META } from "@/lib/query-meta";
import { FORMULA_BUILDERS } from "@/lib/formula-segments";
import { FormulaDisplay } from "@/components/FormulaDisplay";
import { plainFormulaText } from "@/lib/formula-text";

export function ChapterMathView() {
  const state = usePlaygroundStore();
  const meta = QUERY_META[state.queryType];
  const builder = FORMULA_BUILDERS[state.queryType];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-6 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: meta.accent }}>The math</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{meta.description}</p>

      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        {builder ? (
          <FormulaDisplay segments={builder(state)} />
        ) : (
          <code className="block whitespace-normal font-mono text-sm leading-7 text-slate-300">{plainFormulaText(state)}</code>
        )}
        {builder && <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Hover a term for its meaning and current value.</p>}
      </div>
    </div>
  );
}
