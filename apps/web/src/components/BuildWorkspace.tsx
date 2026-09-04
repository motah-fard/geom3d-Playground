"use client";

import { QuerySelector } from "@/components/QuerySelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ScenarioGallery } from "@/components/ScenarioGallery";
import { GlossaryPanel } from "@/components/GlossaryPanel";
import { BadgesPanel } from "@/components/BadgesPanel";
import { ChapterView } from "@/components/ChapterView";
import { CollectionGallery } from "@/components/CollectionGallery";
import { usePlaygroundStore } from "@/store/playground-store";

// The full power-user workspace: every chapter, every tool, all visible at
// once. This is what geom3d looked like before Learn/Explore existed, kept
// intact for anyone who wants direct access to precision/snap/labels,
// save/load, and JSON/PNG export without a curriculum around it.
export function BuildWorkspace() {
  const { activeCollectionId, setActiveCollection } = usePlaygroundStore();

  return (
    <div id="workspace" className="mx-auto grid max-w-[1600px] gap-4 p-4 sm:p-6 xl:grid-cols-[250px_minmax(0,1fr)_340px]">
      <aside className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 shadow-2xl shadow-black/10 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-y-auto" aria-label="Query navigation">
        <div className="mb-4 px-2">
          <p className="text-sm font-semibold text-white">Choose a query</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Objects persist across compatible tools. Reset when you want a fresh example.</p>
        </div>
        <QuerySelector />
        <ScenarioGallery />
        <GlossaryPanel />
        <BadgesPanel />
      </aside>

      {activeCollectionId ? (
        <CollectionGallery collectionId={activeCollectionId} onBack={() => setActiveCollection(null)} />
      ) : (
        <ChapterView showSidebarResults />
      )}

      <aside className={activeCollectionId ? "hidden" : "hidden xl:block"} aria-label="Query results">
        <div className="sticky top-6"><ResultsPanel /></div>
      </aside>
    </div>
  );
}
