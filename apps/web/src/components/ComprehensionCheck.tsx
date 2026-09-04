"use client";

import { useState } from "react";
import type { ComprehensionQuestion } from "@/lib/comprehension-questions";
import { usePlaygroundStore } from "@/store/playground-store";
import { Confetti } from "@/components/Confetti";
import type { QueryType } from "@/types/geometry";

function Quiz({ q, chapterKey }: { q: ComprehensionQuestion; chapterKey: QueryType }) {
  const [picked, setPicked] = useState<number | null>(null);
  // Captured at the moment of picking, before awardCorrectAnswer mutates
  // the store — reading correctAnswerQueries.includes(chapterKey) AFTER
  // that call would always see the just-added entry and think this was
  // never the first time.
  const [wasFirstTimeCorrect, setWasFirstTimeCorrect] = useState(false);
  const { awardCorrectAnswer, recordWrongAnswer, correctAnswerQueries, streak } = usePlaygroundStore();

  const pick = (index: number) => {
    setPicked(index);
    if (index === q.correctIndex) {
      setWasFirstTimeCorrect(!correctAnswerQueries.includes(chapterKey));
      awardCorrectAnswer(chapterKey);
    } else {
      recordWrongAnswer();
    }
  };

  const justCorrect = picked === q.correctIndex;

  return (
    <div className="relative rounded-2xl border border-violet-400/20 bg-violet-400/[0.04] p-4">
      {justCorrect && wasFirstTimeCorrect && <Confetti seed={q.question.length + picked!} />}
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300/70">Check your understanding</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{q.question}</p>
      <div className="mt-3 space-y-2">
        {q.options.map((option, index) => {
          const isPicked = picked === index;
          const isCorrect = index === q.correctIndex;
          const showState = picked !== null;
          const stateClass = !showState
            ? "border-slate-700 bg-slate-900 hover:border-violet-400/40 hover:bg-slate-800"
            : isCorrect
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
              : isPicked
                ? "border-rose-400/40 bg-rose-400/10 text-rose-100"
                : "border-slate-800 bg-slate-900/50 text-slate-500";
          return (
            <button
              key={index}
              type="button"
              disabled={showState}
              onClick={() => pick(index)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition disabled:cursor-default ${stateClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300`}
            >
              <span aria-hidden="true">{showState ? (isCorrect ? "✓" : isPicked ? "✗" : "○") : "○"}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 text-xs leading-5 text-slate-400">
          <span className={`font-bold ${justCorrect ? "text-emerald-300" : "text-rose-300"}`}>
            {justCorrect ? (wasFirstTimeCorrect ? `Correct! +15 points${streak > 1 ? ` · 🔥 ${streak} in a row` : ""} — ` : "Correct — ") : "Not quite — "}
          </span>
          {q.explanation}
        </p>
      )}
    </div>
  );
}

export function ComprehensionCheck({ question, chapterKey }: { question: ComprehensionQuestion | undefined; chapterKey: QueryType }) {
  if (!question) return null;
  // Remounting on chapter change resets the picked answer without extra state wiring.
  return <Quiz key={chapterKey} q={question} chapterKey={chapterKey} />;
}
