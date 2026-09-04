"use client";

import { useEffect, useState } from "react";
import { TRY_IT_CHALLENGES } from "@/lib/try-it-challenges";
import { usePlaygroundStore } from "@/store/playground-store";
import { Confetti } from "@/components/Confetti";
import type { QueryType } from "@/types/geometry";

function Challenge({ chapterKey }: { chapterKey: QueryType }) {
  const challenge = TRY_IT_CHALLENGES[chapterKey];
  const state = usePlaygroundStore();
  const { awardCorrectAnswer, correctAnswerQueries } = state;
  const [everSolved, setEverSolved] = useState(false);
  const [firstTimeSolved, setFirstTimeSolved] = useState(false);

  const solved = challenge ? challenge.isSolved(state) : false;

  // Adjusting this component's own local state during render (in response
  // to `solved` newly becoming true) is fine — but awarding points touches
  // the shared store other components read (e.g. the points/streak badge),
  // and doing that mid-render triggers React's "Cannot update a component
  // while rendering a different component" error. That side effect has to
  // wait for the effect phase, after this render has committed.
  if (solved && !everSolved) {
    setEverSolved(true);
    setFirstTimeSolved(!correctAnswerQueries.includes(chapterKey));
  }

  useEffect(() => {
    if (everSolved) awardCorrectAnswer(chapterKey);
  }, [everSolved, chapterKey, awardCorrectAnswer]);

  if (!challenge) return null;

  return (
    <div className="relative rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
      {solved && firstTimeSolved && <Confetti seed={challenge.prompt.length} />}
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300/70">Try it</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{challenge.prompt}</p>
      <p className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${solved ? "text-emerald-300" : "text-slate-500"}`}>
        <span aria-hidden="true">{solved ? "✓" : "○"}</span>
        {solved ? (firstTimeSolved ? "You found it! +15 points" : "Solved") : "Not there yet — keep adjusting."}
      </p>
    </div>
  );
}

export function TryItChallenge({ chapterKey }: { chapterKey: QueryType }) {
  // Remounting on chapter change resets the solved-state tracking without extra wiring.
  return <Challenge key={chapterKey} chapterKey={chapterKey} />;
}
