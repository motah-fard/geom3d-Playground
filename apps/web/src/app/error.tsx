"use client";

import { useEffect } from "react";
import Link from "next/link";

// Catches render-time crashes anywhere below the home page — most likely a
// WebGL/Three.js failure inside one chapter's scene — and offers a way back
// instead of Next's bare default error screen.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Something went wrong</p>
      <h1 className="text-2xl font-semibold">This scene hit a snag rendering.</h1>
      <p className="max-w-md text-sm text-slate-400">
        Your progress is saved. Try reloading it, or head back and pick a different chapter.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/30"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
