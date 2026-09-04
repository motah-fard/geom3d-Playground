"use client";

import { TopNav } from "@/components/TopNav";
import { WorkspaceActions } from "@/components/WorkspaceActions";
import { BuildWorkspace } from "@/components/BuildWorkspace";
import { CollectionGallery } from "@/components/CollectionGallery";
import { ChapterView } from "@/components/ChapterView";
import { LearnHome } from "@/components/LearnHome";
import { ExploreHome } from "@/components/ExploreHome";
import { usePlaygroundStore } from "@/store/playground-store";

export function ClientPageShell() {
  const { appMode, showHome, activeCollectionId, setActiveCollection, setShowHome } = usePlaygroundStore();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#102535_0,#071018_38%,#050b11_100%)] text-slate-100">
      <a href="#workspace" className="sr-only z-50 rounded bg-cyan-300 px-4 py-2 text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to workspace</a>
      <TopNav />
      {/* Always mounted — it owns the theme/progress/last-visited-chapter
          hydration effects regardless of which mode is showing, and
          renders its own visible toolbar only in Build mode. */}
      <WorkspaceActions />

      {appMode === "build" ? (
        <BuildWorkspace />
      ) : activeCollectionId ? (
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6">
          <CollectionGallery collectionId={activeCollectionId} onBack={() => setActiveCollection(null)} />
        </div>
      ) : showHome ? (
        appMode === "learn" ? <LearnHome /> : <ExploreHome />
      ) : (
        <div id="workspace" className="mx-auto max-w-[900px] p-4 sm:p-6">
          <ChapterView showSidebarResults={false} onBack={() => setShowHome(true)} />
        </div>
      )}

      <footer className="border-t border-white/5 bg-slate-950/45 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1600px] text-xs leading-5 text-slate-500">
          <p>
            Free for students, teachers, schools, and personal or hobby use — no account, no paywall. Licensed under the{" "}
            <a href="https://polyformproject.org/licenses/noncommercial/1.0.0" target="_blank" rel="noopener noreferrer" className="underline decoration-slate-700 underline-offset-2 hover:text-slate-300 hover:decoration-slate-500">PolyForm Noncommercial License 1.0.0</a>
            {" "}— commercial use (building a paid product or service on top of this code) requires a separate license from the author.
          </p>
        </div>
      </footer>
    </main>
  );
}
