"use client";

import { LEARNING_COLLECTIONS, LEARNING_PATH, QUERY_META, type LearningCollectionId } from "@/lib/query-meta";
import { usePlaygroundStore } from "@/store/playground-store";
import { ChapterPreview } from "@/components/ChapterPreview";
import { IntroSection } from "@/components/IntroSection";

export function LearnHome() {
  const { correctAnswerQueries, visitedQueries, setQueryType, setShouldAutoRun, saveCheckpoint, setActiveCollection } = usePlaygroundStore();
  const nextToLearn = LEARNING_PATH.find((query) => !correctAnswerQueries.includes(query));
  const visitedCount = LEARNING_PATH.filter((query) => visitedQueries.includes(query)).length;

  const openCollection = (id: LearningCollectionId) => setActiveCollection(id);
  const continueLearning = () => {
    if (!nextToLearn) return;
    saveCheckpoint();
    setQueryType(nextToLearn);
    setShouldAutoRun(true);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Don&rsquo;t just see geometry. Change it.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Every visualization here is computed live from the mathematics underneath — not an animation standing in for it.
          Drag anything, and the numbers, the shape, and the code all move together.
        </p>
      </div>

      {nextToLearn && (
        <button
          type="button"
          onClick={continueLearning}
          className="group flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-left transition hover:border-cyan-400/40 hover:shadow-[0_0_24px_-8px_var(--color-primary-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:p-5"
        >
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900 sm:h-28 sm:w-28">
            <ChapterPreview query={nextToLearn} color={QUERY_META[nextToLearn].accent} hovered={false} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">Continue learning · {visitedCount} / {LEARNING_PATH.length} explored</p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              {QUERY_META[nextToLearn].emoji && <span aria-hidden="true">{QUERY_META[nextToLearn].emoji}</span>}
              {QUERY_META[nextToLearn].title}
            </h2>
            <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm">{QUERY_META[nextToLearn].description}</p>
          </div>
          <span className="shrink-0 self-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs font-bold text-cyan-200 transition group-hover:bg-cyan-400/15">Continue →</span>
        </button>
      )}

      <div>
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Learning paths</h2>
        <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {LEARNING_COLLECTIONS.map((collection) => {
            const learnedCount = collection.queries.filter((q) => correctAnswerQueries.includes(q)).length;
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => openCollection(collection.id)}
                className="group flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/55 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_-8px_var(--color-primary-glow)]"
                style={{ borderColor: undefined }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-base font-bold text-white">
                    <span aria-hidden="true">{collection.emoji}</span>
                    {collection.title}
                  </p>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500">{learnedCount} / {collection.queries.length}</span>
                </div>
                <p className="text-xs leading-5 text-slate-400">{collection.tagline}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(learnedCount / collection.queries.length) * 100}%`, backgroundColor: collection.accent }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <IntroSection />
    </div>
  );
}
