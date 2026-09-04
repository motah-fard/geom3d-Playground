"use client";

import { usePlaygroundStore } from "@/store/playground-store";
import { QUERY_META } from "@/lib/query-meta";
import { CODE_SNIPPETS } from "@/lib/code-snippets.generated";

export function ChapterCodeView() {
  const queryType = usePlaygroundStore((state) => state.queryType);
  const meta = QUERY_META[queryType];
  const snippet = CODE_SNIPPETS[queryType];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-6 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: meta.accent }}>The code</p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
        The exact function this chapter&rsquo;s scene calls, live — not a simplified illustration. Every drag you make runs this code.
      </p>
      {snippet ? (
        <>
          <pre className="mt-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-[13px] leading-6 text-slate-200">
            <code>{snippet.code}</code>
          </pre>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">{snippet.sourceLabel}</p>
        </>
      ) : (
        <p className="mt-6 text-sm text-slate-500">No source excerpt is available for this chapter yet.</p>
      )}
    </div>
  );
}
