"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { localLogSpiral, logSpiralPoint } from "@/lib/local-geometry";

const TURNS = 3;
const SAMPLES_PER_TURN = 72;

// The two control points only ever move along the positive X axis — only
// their distance from the origin is meaningful, so any off-axis drag is
// projected back onto the axis for both the math and the rendered position.
function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function LogSpiralScene() {
  const { spiralStart, spiralTurn, setSpiralInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const start = onAxis(spiralStart);
  const turn = onAxis(spiralTurn);
  const { a, b } = localLogSpiral({ start, turn });

  const curve: [number, number, number][] = [];
  const totalSamples = TURNS * SAMPLES_PER_TURN;
  for (let i = 0; i <= totalSamples; i++) {
    const theta = (i / SAMPLES_PER_TURN) * (2 * Math.PI);
    curve.push(toTuple(logSpiralPoint(theta, a, b)));
  }

  return (
    <>
      <Line points={curve} color="orange" lineWidth={2.5} />

      {/* radius guides */}
      <Line points={[[0, 0, 0], toTuple(start)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[0, 0, 0], toTuple(turn)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />

      <DraggablePoint
        position={start}
        color="hotpink"
        id="spiralStart"
        label={objectLabels.spiralStart}
        onChange={(p) => {
          setSpiralInputs({ start: onAxis(p), turn });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={turn}
        color="cyan"
        id="spiralTurn"
        label={objectLabels.spiralTurn}
        onChange={(p) => {
          setSpiralInputs({ start, turn: onAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
