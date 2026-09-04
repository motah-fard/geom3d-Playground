"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { localAngle } from "@/lib/local-geometry";

const RAY_LENGTH = 2.6;
const ARC_RADIUS = 1;
const ARC_SAMPLES = 64;

function onRadius(p: Vec3, radius: number): Vec3 {
  const angle = Math.atan2(p.y, p.x);
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0 };
}

const CLASSIFICATION_COLOR: Record<string, string> = {
  acute: "#4ade80",
  right: "#38bdf8",
  obtuse: "#facc15",
  straight: "#f472b6",
  reflex: "#f87171",
};

export function AnglesScene() {
  const { angleRayB, setAngleInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const rayB = onRadius(angleRayB, RAY_LENGTH);
  const { angleDeg, classification } = localAngle(rayB);

  const arcPoints: [number, number, number][] = [];
  const sweepRad = (angleDeg * Math.PI) / 180;
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = (i / ARC_SAMPLES) * sweepRad;
    arcPoints.push([ARC_RADIUS * Math.cos(t), ARC_RADIUS * Math.sin(t), 0]);
  }

  return (
    <>
      <Line points={[[0, 0, 0], [RAY_LENGTH, 0, 0]]} color="#94a3b8" lineWidth={2.5} />
      <Line points={[[0, 0, 0], toTuple(rayB)]} color="orange" lineWidth={2.5} />
      <Line points={arcPoints} color={CLASSIFICATION_COLOR[classification] ?? "#38bdf8"} lineWidth={3} />

      <DraggablePoint
        position={rayB}
        color="hotpink"
        id="angleRayB"
        label={objectLabels.angleRayB}
        onChange={(p) => {
          setAngleInput(onRadius(p, RAY_LENGTH));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
