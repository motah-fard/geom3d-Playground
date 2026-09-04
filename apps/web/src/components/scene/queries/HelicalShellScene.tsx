"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { helicalShellPoint, localHelicalShell } from "@/lib/local-geometry";

const TURNS = 5;
const SAMPLES_PER_TURN = 48;

// S only ever moves along the positive X axis at the base (z = 0) — only
// its distance from the axis is meaningful.
function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// T's distance from the axis sets the radius after one turn, exactly like
// S, but its height (z) is now meaningful too — the rise after one turn —
// so it is preserved rather than collapsed to zero.
function onAxisWithHeight(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: p.z };
}

export function HelicalShellScene() {
  const { helixStart, helixTurn, setHelixInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const start = onAxis(helixStart);
  const turn = onAxisWithHeight(helixTurn);
  const { a, b, c } = localHelicalShell({ start, turn });

  const curve: [number, number, number][] = [];
  const totalSamples = TURNS * SAMPLES_PER_TURN;
  for (let i = 0; i <= totalSamples; i++) {
    const theta = (i / SAMPLES_PER_TURN) * (2 * Math.PI);
    curve.push(toTuple(helicalShellPoint(theta, a, b, c)));
  }

  return (
    <>
      <Line points={curve} color="orange" lineWidth={2.5} />

      {/* radius guide for S, and radius + rise guides for T */}
      <Line points={[[0, 0, 0], toTuple(start)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[0, 0, 0], [turn.x, turn.y, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[turn.x, turn.y, 0], toTuple(turn)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />

      <DraggablePoint
        position={start}
        color="#FFD166"
        id="helixStart"
        label={objectLabels.helixStart}
        onChange={(p) => {
          setHelixInputs({ start: onAxis(p), turn });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={turn}
        color="#29C7E8"
        id="helixTurn"
        label={objectLabels.helixTurn}
        onChange={(p) => {
          setHelixInputs({ start, turn: onAxisWithHeight(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
