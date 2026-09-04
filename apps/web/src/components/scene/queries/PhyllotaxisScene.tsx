"use client";

import { useMemo, useRef, useState } from "react";
import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple } from "@/types/geometry";
import {
  PHYLLOTAXIS_DIAL_RADIUS,
  PHYLLOTAXIS_SCALE,
  PHYLLOTAXIS_SEED_COUNT,
  localPhyllotaxis,
  phyllotaxisPoint,
} from "@/lib/local-geometry";

const DIAL_SAMPLES = 64;
const SEEDS_PER_SECOND = 45;

export function PhyllotaxisScene() {
  const { phyllotaxisDivergence, setPhyllotaxisInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const [seedCount, setSeedCount] = useState(PHYLLOTAXIS_SEED_COUNT);
  const [growing, setGrowing] = useState(false);
  const growthClock = useRef(0);

  const { divergenceDeg } = localPhyllotaxis(phyllotaxisDivergence);
  const divergenceRad = divergenceDeg * (Math.PI / 180);

  const dialPosition = {
    x: PHYLLOTAXIS_DIAL_RADIUS * Math.cos(divergenceRad),
    y: PHYLLOTAXIS_DIAL_RADIUS * Math.sin(divergenceRad),
    z: 0,
  };

  useFrame((_state, delta) => {
    if (!growing) return;
    growthClock.current += delta;
    const next = Math.min(PHYLLOTAXIS_SEED_COUNT, Math.floor(growthClock.current * SEEDS_PER_SECOND));
    setSeedCount(next);
    if (next >= PHYLLOTAXIS_SEED_COUNT) setGrowing(false);
  });

  const startGrowth = () => {
    growthClock.current = 0;
    setSeedCount(0);
    setGrowing(true);
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
        <div className="pointer-events-auto absolute bottom-14 left-3 right-3 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-[10px] font-semibold text-slate-300 backdrop-blur">
          <button
            type="button"
            onClick={() => (growing ? setGrowing(false) : startGrowth())}
            className="shrink-0 rounded-md px-2 py-1 text-slate-200 transition hover:bg-slate-800"
          >
            {growing ? "⏸" : "▶"}
          </button>
          <input
            type="range"
            min={0}
            max={PHYLLOTAXIS_SEED_COUNT}
            value={seedCount}
            onChange={(event) => {
              setGrowing(false);
              setSeedCount(Number(event.target.value));
            }}
            className="h-1 flex-1 accent-[#F3B95F]"
            aria-label="Seeds grown"
          />
          <span className="w-16 shrink-0 text-right font-mono">{seedCount} / {PHYLLOTAXIS_SEED_COUNT}</span>
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
