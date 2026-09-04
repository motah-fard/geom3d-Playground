"use client";

import { LEARNING_COLLECTIONS, type LearningCollectionId } from "@/lib/query-meta";
import { usePlaygroundStore } from "@/store/playground-store";

// No progress bars, no "continue" nagging — just the shapes, for anyone who
// landed here because they saw something beautiful and wants to play with
// it, not sit through a curriculum.
export function ExploreHome() {
  const setActiveCollection = usePlaygroundStore((state) => state.setActiveCollection);
  const openCollection = (id: LearningCollectionId) => setActiveCollection(id);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Beautiful mathematics, no curriculum required</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          Click anything and play. Every shape below is computed live from the mathematics underneath — drag it and watch
          the numbers move with it, not a canned animation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {LEARNING_COLLECTIONS.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => openCollection(collection.id)}
            className="group flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-950/55 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_-8px_var(--color-primary-glow)]"
          >
            <p className="flex items-center gap-2 text-base font-bold text-white">
              <span aria-hidden="true">{collection.emoji}</span>
              {collection.title}
            </p>
            <p className="text-xs leading-5 text-slate-400">{collection.tagline}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: collection.accent }}>{collection.queries.length} shapes →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
