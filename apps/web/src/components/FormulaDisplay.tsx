"use client";

import { usePlaygroundStore } from "@/store/playground-store";
import type { FormulaSegment } from "@/lib/formula-segments";

export function FormulaDisplay({ segments }: { segments: FormulaSegment[] }) {
  const setHoveredTerm = usePlaygroundStore((store) => store.setHoveredTerm);

  return (
    <code className="mt-2 block whitespace-normal font-mono text-[11px] leading-5 text-slate-400">
      {segments.map((segment, index) =>
        segment.kind === "text" ? (
          <span key={index}>{segment.text}</span>
        ) : (
          <span
            key={index}
            tabIndex={0}
            className="group relative cursor-help rounded border-b border-dashed border-amber-300/60 font-bold text-amber-200 outline-none hover:bg-amber-300/10 focus-visible:bg-amber-300/10"
            onMouseEnter={() => setHoveredTerm({ targetId: segment.targetId, symbol: segment.symbol, meaning: segment.meaning, value: segment.value })}
            onMouseLeave={() => setHoveredTerm(null)}
            onFocus={() => setHoveredTerm({ targetId: segment.targetId, symbol: segment.symbol, meaning: segment.meaning, value: segment.value })}
            onBlur={() => setHoveredTerm(null)}
          >
            {segment.symbol}
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-max max-w-[220px] -translate-x-1/2 rounded-lg border border-amber-300/30 bg-slate-950 px-2.5 py-1.5 text-center shadow-2xl group-hover:block group-focus-visible:block">
              <span className="block font-mono text-[11px] font-bold text-amber-200">{segment.symbol} = {segment.value}</span>
              <span className="mt-0.5 block whitespace-normal font-sans text-[10px] font-normal leading-4 text-slate-300">{segment.meaning}</span>
            </span>
          </span>
        )
      )}
    </code>
  );
}
