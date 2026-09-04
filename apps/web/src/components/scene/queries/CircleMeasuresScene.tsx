"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { localCircleMeasures } from "@/lib/local-geometry";

const CIRCLE_SAMPLES = 96;
const ARC_SAMPLES = 64;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function CircleMeasuresScene() {
  const { circleRadius, circleAngle, setCircleMeasuresInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const radiusPoint = onAxis(circleRadius);
  const { radius, centralAngleDeg } = localCircleMeasures(radiusPoint, circleAngle);
  const sweepRad = (centralAngleDeg * Math.PI) / 180;

  const circlePoints: [number, number, number][] = [];
  for (let i = 0; i <= CIRCLE_SAMPLES; i++) {
    const t = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    circlePoints.push([radius * Math.cos(t), radius * Math.sin(t), 0]);
  }

  const sectorPoints: [number, number, number][] = [[0, 0, 0]];
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = (i / ARC_SAMPLES) * sweepRad;
    sectorPoints.push([radius * Math.cos(t), radius * Math.sin(t), 0]);
  }
  sectorPoints.push([0, 0, 0]);

  const anglePointRendered: Vec3 = { x: radius * Math.cos(sweepRad), y: radius * Math.sin(sweepRad), z: 0 };

  return (
    <>
      <Line points={circlePoints} color="#94a3b8" lineWidth={1.5} />
      <Line points={sectorPoints} color="orange" lineWidth={2.5} />

      <DraggablePoint
        position={radiusPoint}
        color="hotpink"
        id="circleRadius"
        label={objectLabels.circleRadius}
        onChange={(p) => {
          setCircleMeasuresInputs({ radiusPoint: onAxis(p), anglePoint: circleAngle });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={anglePointRendered}
        color="cyan"
        id="circleAngle"
        label={objectLabels.circleAngle}
        onChange={(p) => {
          setCircleMeasuresInputs({ radiusPoint, anglePoint: p });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
