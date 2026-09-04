"use client";

import { useState } from "react";
import { useFrame } from "@react-three/fiber";

export type BuildSpeed = 0.5 | 1 | 2;

// Drives a 0..1 "build" progress value at a constant per-second rate
// (scaled by `speed`), advanced via delta time each frame so pausing
// simply stops accumulation — unlike a wall-clock elapsedTime diff,
// this survives being paused and resumed mid-build.
export function useBuildAnimation(durationSAt1x: number) {
  const [progress, setProgress] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<BuildSpeed>(1);

  useFrame((_state, delta) => {
    if (!playing) return;
    setProgress((p) => {
      const next = p + (delta * speed) / durationSAt1x;
      if (next >= 1) {
        setPlaying(false);
        return 1;
      }
      return next;
    });
  });

  const play = () => {
    setProgress((p) => (p >= 1 ? 0 : p));
    setPlaying(true);
  };
  const pause = () => setPlaying(false);
  const reset = () => {
    setProgress(0);
    setPlaying(false);
  };

  return { progress, setProgress, playing, play, pause, reset, speed, setSpeed };
}
