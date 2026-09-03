"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
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

export function PhyllotaxisScene() {
  const { phyllotaxisDivergence, setPhyllotaxisInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const { divergenceDeg } = localPhyllotaxis(phyllotaxisDivergence);
  const divergenceRad = divergenceDeg * (Math.PI / 180);

  const dialPosition = {
    x: PHYLLOTAXIS_DIAL_RADIUS * Math.cos(divergenceRad),
    y: PHYLLOTAXIS_DIAL_RADIUS * Math.sin(divergenceRad),
    z: 0,
  };

  const positions = useMemo(() => {
    const array = new Float32Array(PHYLLOTAXIS_SEED_COUNT * 3);
    for (let i = 1; i <= PHYLLOTAXIS_SEED_COUNT; i++) {
      const p = phyllotaxisPoint(i, divergenceRad, PHYLLOTAXIS_SCALE);
      array[(i - 1) * 3] = p.x;
      array[(i - 1) * 3 + 1] = p.y;
      array[(i - 1) * 3 + 2] = p.z;
    }
    return array;
  }, [divergenceRad]);

  const dial: [number, number, number][] = [];
  for (let i = 0; i <= DIAL_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / DIAL_SAMPLES;
    dial.push([PHYLLOTAXIS_DIAL_RADIUS * Math.cos(theta), PHYLLOTAXIS_DIAL_RADIUS * Math.sin(theta), 0]);
  }

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="orange" size={0.12} sizeAttenuation />
      </points>

      <Line points={dial} color="#475569" lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />
      <Line points={[[0, 0, 0], toTuple(dialPosition)]} color="#475569" lineWidth={1} />

      <DraggablePoint
        position={dialPosition}
        color="hotpink"
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
