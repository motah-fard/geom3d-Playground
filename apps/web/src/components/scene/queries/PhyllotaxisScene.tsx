"use client";

import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import { toTuple } from "@/types/geometry";
import {
  GOLDEN_ANGLE_RAD,
  PHYLLOTAXIS_DIAL_RADIUS,
  PHYLLOTAXIS_SCALE,
  PHYLLOTAXIS_SEED_COUNT,
  localPhyllotaxis,
  phyllotaxisPoint,
} from "@/lib/local-geometry";

const ANGLE_PRESETS: { label: string; deg: number }[] = [
  { label: "90°", deg: 90 },
  { label: "120°", deg: 120 },
  { label: "Golden 137.5°", deg: GOLDEN_ANGLE_RAD * (180 / Math.PI) },
];

const DIAL_SAMPLES = 64;
const SEEDS_PER_SECOND = 45;
const GROW_DURATION_S = PHYLLOTAXIS_SEED_COUNT / SEEDS_PER_SECOND;

export function PhyllotaxisScene() {
  const { phyllotaxisDivergence, setPhyllotaxisInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { progress: growthProgress, setProgress: setGrowthProgress, playing: growing, play, pause, reset, speed, setSpeed } = useBuildAnimation(GROW_DURATION_S);
  const seedCount = Math.round(growthProgress * PHYLLOTAXIS_SEED_COUNT);

  const { divergenceDeg } = localPhyllotaxis(phyllotaxisDivergence);
  const divergenceRad = divergenceDeg * (Math.PI / 180);

  const dialPosition = {
    x: PHYLLOTAXIS_DIAL_RADIUS * Math.cos(divergenceRad),
    y: PHYLLOTAXIS_DIAL_RADIUS * Math.sin(divergenceRad),
    z: 0,
  };

  const setDivergenceDeg = (deg: number) => {
    const rad = deg * (Math.PI / 180);
    setPhyllotaxisInput({ x: PHYLLOTAXIS_DIAL_RADIUS * Math.cos(rad), y: PHYLLOTAXIS_DIAL_RADIUS * Math.sin(rad), z: 0 });
    setShouldAutoRun(true);
  };

  const positions = useMemo(() => {
    const array = new Float32Array(Math.max(seedCount, 1) * 3);
    for (let i = 1; i <= seedCount; i++) {
      const p = phyllotaxisPoint(i, divergenceRad, PHYLLOTAXIS_SCALE);
      array[(i - 1) * 3] = p.x;
      array[(i - 1) * 3 + 1] = p.y;
      array[(i - 1) * 3 + 2] = p.z;
    }
    return array;
  }, [divergenceRad, seedCount]);

  const dial: [number, number, number][] = [];
  for (let i = 0; i <= DIAL_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / DIAL_SAMPLES;
    dial.push([PHYLLOTAXIS_DIAL_RADIUS * Math.cos(theta), PHYLLOTAXIS_DIAL_RADIUS * Math.sin(theta), 0]);
  }

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3 flex flex-wrap gap-1.5">
          {ANGLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setDivergenceDeg(preset.deg)}
              className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 backdrop-blur transition hover:text-white"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDivergenceDeg(Math.random() * 360)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 backdrop-blur transition hover:text-white"
          >
            🎲 Random
          </button>
        </div>
        <div className="pointer-events-auto absolute bottom-14 left-3 right-3 flex items-center gap-2">
          <div className="flex-1">
            <BuildControls
              label="Seeds grown"
              playing={growing}
              progress={growthProgress}
              onPlayPause={() => (growing ? pause() : play())}
              onReset={reset}
              onScrub={setGrowthProgress}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </div>
          <span className="shrink-0 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-2 font-mono text-[10px] font-semibold text-slate-300 backdrop-blur">{seedCount} / {PHYLLOTAXIS_SEED_COUNT}</span>
        </div>
      </Html>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#F3B95F" size={0.12} sizeAttenuation />
      </points>

      <Line points={dial} color="#475569" lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />
      <Line points={[[0, 0, 0], toTuple(dialPosition)]} color="#475569" lineWidth={1} />

      <DraggablePoint
        position={dialPosition}
        color="#FFD166"
        id="phyllotaxisDivergence"
        label={objectLabels.phyllotaxisDivergence}
        onChange={(p) => {
          setPhyllotaxisInput(p);
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
