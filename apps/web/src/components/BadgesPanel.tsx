"use client";

import { usePlaygroundStore } from "@/store/playground-store";
import { BADGES } from "@/lib/badges";

export function BadgesPanel() {
  const { visitedQueries, correctAnswerQueries, bestStreak } = usePlaygroundStore();
  const progress = { visitedQueries, correctAnswerQueries, bestStreak };
  const unlockedCount = BADGES.filter((badge) => badge.isUnlocked(progress)).length;

  return (
    <details className="mt-5 border-t border-slate-800 pt-4">
      <summary className="cursor-pointer list-none px-2 text-xs font-bold text-slate-400 hover:text-white">
        Badges <span className="text-slate-600">({unlockedCount}/{BADGES.length})</span> <span aria-hidden="true">⌄</span>
      </summary>
      <div className="mt-2 grid grid-cols-2 gap-2 px-1">
        {BADGES.map((badge) => {
          const unlocked = badge.isUnlocked(progress);
          return (
            <div
              key={badge.id}
              className={`rounded-xl border p-2.5 text-center transition ${unlocked ? "border-amber-300/30 bg-amber-300/[0.06]" : "border-slate-800 bg-slate-900/40 opacity-50"}`}
              title={badge.description}
            >
              <div className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{badge.emoji}</div>
              <p className={`mt-1 text-[10px] font-bold leading-tight ${unlocked ? "text-amber-200" : "text-slate-500"}`}>{badge.name}</p>
            </div>
          );
        })}
      </div>
    </details>
  );
}
