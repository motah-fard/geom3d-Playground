"use client";

import { useState } from "react";
import { LEARNING_COLLECTIONS, QUERY_META, type LearningCollectionId } from "@/lib/query-meta";
import { usePlaygroundStore } from "@/store/playground-store";
import type { QueryType } from "@/types/geometry";
import { trackInteraction } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ChapterPreview } from "@/components/ChapterPreview";

function GalleryCard({ query, accent }: { query: QueryType; accent: string }) {
  const meta = QUERY_META[query];
  const { setQueryType, setShouldAutoRun, saveCheckpoint, correctAnswerQueries } = usePlaygroundStore();
  const [hovered, setHovered] = useState(false);
  const learned = correctAnswerQueries.includes(query);

  const select = () => {
    saveCheckpoint();
    trackInteraction("query_changed", { query });
    setQueryType(query);
    setShouldAutoRun(true);
  };

  return (
    <button
      type="button"
      onClick={select}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/55 text-left transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_-8px_var(--color-primary-glow)]"
      style={{ borderColor: hovered ? `${accent}66` : undefined }}
    >
      <div className="relative h-36 w-full shrink-0" style={{ background: `radial-gradient(circle at center, ${accent}24, transparent 70%)` }}>
        <ChapterPreview query={query} color={meta.accent} hovered={hovered} />
        {learned && (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-300">✓</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
            {meta.emoji && <span aria-hidden="true">{meta.emoji}</span>}
            {meta.shortTitle}
          </h3>
          <DifficultyBadge difficulty={meta.difficulty} className="shrink-0" />
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-slate-400">{meta.description}</p>
      </div>
    </button>
  );
}

export function CollectionGallery({ collectionId, onBack }: { collectionId: LearningCollectionId; onBack: () => void }) {
  const collection = LEARNING_COLLECTIONS.find((c) => c.id === collectionId);
  if (!collection) return null;

  return (
    <section aria-labelledby="collection-gallery-title" className="space-y-4">
      <div className="rounded-2xl -mx-1 px-1 py-2" style={{ background: `radial-gradient(ellipse at top left, ${collection.accent}14, transparent 70%)` }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: collection.accent }}>{collection.emoji} {collection.title}</p>
            <h2 id="collection-gallery-title" className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{collection.tagline}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Hover a card to see it turn; click one to explore it.</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {collection.queries.map((query) => (
          <GalleryCard key={query} query={query} accent={collection.accent} />
        ))}
      </div>
    </section>
  );
}
