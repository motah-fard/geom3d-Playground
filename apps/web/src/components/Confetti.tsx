"use client";

import { useMemo } from "react";

const COLORS = ["#fbbf24", "#f472b6", "#38bdf8", "#4ade80", "#a78bfa", "#fb923c"];
const PIECE_COUNT = 24;

// A pure (no shared mutable state) pseudo-random value in [0, 1) from a
// seed and an index — each call is independent, so it's safe to use
// freely inside a render-phase computation like useMemo.
function pseudoRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Confetti({ seed }: { seed: number }) {
  const pieces = useMemo(() => {
    // Deterministic-per-burst pseudo-randomness keyed on `seed`, so a new
    // burst looks different each time without needing external state.
    return Array.from({ length: PIECE_COUNT }, (_, i) => {
      const angle = pseudoRandom(seed, i * 6 + 1) * Math.PI * 2;
      const distance = 60 + pseudoRandom(seed, i * 6 + 2) * 90;
      return {
        color: COLORS[Math.floor(pseudoRandom(seed, i * 6 + 3) * COLORS.length)],
        left: 40 + pseudoRandom(seed, i * 6 + 4) * 20,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        rot: (pseudoRandom(seed, i * 6 + 5) - 0.5) * 720,
        delay: pseudoRandom(seed, i * 6 + 6) * 100,
        size: 6 + pseudoRandom(seed, i * 6) * 6,
      };
    });
  }, [seed]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-1/2 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            "--confetti-x": `${p.x}px`,
            "--confetti-y": `${p.y}px`,
            "--confetti-rot": `${p.rot}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
