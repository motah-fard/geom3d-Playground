"use client";

import { useState } from "react";
import { batchClosestPointSegments } from "@/lib/api";
import type { BatchClosestPointSegmentsResponse, Segment } from "@/types/geometry";

const SEGMENT_COUNTS = [100, 1_000, 5_000, 20_000] as const;

function randomSegments(n: number): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < n; i++) {
    segments.push({
      a: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 },
      b: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 100 },
    });
  }
  return segments;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-bold text-cyan-100">{value}</p>
    </div>
  );
}

export function ConcurrencyDemo() {
  const [count, setCount] = useState<number>(5_000);
  const [result, setResult] = useState<BatchClosestPointSegmentsResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setStatus("running");
    setError(null);
    try {
      const response = await batchClosestPointSegments({
        point: { x: 50, y: 50, z: 50 },
        segments: randomSegments(count),
      });
      setResult(response);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      setStatus("error");
    }
  }

  const speedup = result ? result.sequentialMicros / Math.max(result.parallelMicros, 1) : null;

  return (
    <details className="mt-5 border-t border-slate-800 pt-4">
      <summary className="cursor-pointer list-none px-2 text-xs font-bold text-slate-400 hover:text-white">
        Concurrency demo <span aria-hidden="true">⌄</span>
      </summary>
      <div className="mt-2 space-y-3 px-1">
        <p className="text-[11px] leading-4 text-slate-500">
          The Go API finds the single closest segment to a point among many thousands, timing the same scan done sequentially and fanned out across goroutines — real numbers from the real backend, not illustrative ones.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {SEGMENT_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={count === n}
              onClick={() => setCount(n)}
              className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${count === n ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"}`}
            >
              {n.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={run}
          disabled={status === "running"}
          className="w-full rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
        >
          {status === "running" ? "Running…" : `Run with ${count.toLocaleString()} segments`}
        </button>

        {status === "error" && (
          <p className="text-[11px] text-rose-300">{error} — is the API backend running?</p>
        )}

        {result && status !== "error" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Sequential" value={`${result.sequentialMicros.toFixed(0)} µs`} />
              <Stat label="Parallel" value={`${result.parallelMicros.toFixed(0)} µs`} />
              <Stat label="Workers" value={String(result.numWorkers)} />
              <Stat label="Segments" value={result.numSegments.toLocaleString()} />
            </div>
            <p className="text-[11px] leading-4 text-slate-500">
              {speedup && speedup > 1.05
                ? `${speedup.toFixed(2)}x faster with goroutines at this size.`
                : "No real speedup at this size — spinning up goroutines costs more than the sequential scan saves. Try 20,000 to see it flip."}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
