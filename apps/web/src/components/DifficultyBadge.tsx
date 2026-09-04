import type { Difficulty } from "@/lib/query-meta";

const STYLES: Record<Difficulty, string> = {
  Beginner: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  Intermediate: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  Advanced: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

export function DifficultyBadge({ difficulty, className = "" }: { difficulty: Difficulty; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STYLES[difficulty]} ${className}`}>
      {difficulty}
    </span>
  );
}
