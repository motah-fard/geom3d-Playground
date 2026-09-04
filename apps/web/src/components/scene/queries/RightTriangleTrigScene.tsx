"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { localRightTriangleTrig, RIGHT_TRIANGLE_TRIG_HYPOTENUSE } from "@/lib/local-geometry";

function onAngle(p: Vec3): Vec3 {
  return { x: Math.max(p.x, 1e-6), y: Math.abs(p.y), z: 0 };
}

export function RightTriangleTrigScene() {
  const { trigAngle, setRightTriangleTrigInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const anglePoint = onAngle(trigAngle);
  const { angleDeg, adjacent, hypotenuse } = localRightTriangleTrig(anglePoint);
  const angleRad = (angleDeg * Math.PI) / 180;
  const tip: [number, number, number] = [hypotenuse * Math.cos(angleRad), hypotenuse * Math.sin(angleRad), 0];
  const foot: [number, number, number] = [adjacent, 0, 0];

  const handlePosition: Vec3 = { x: hypotenuse * Math.cos(angleRad), y: hypotenuse * Math.sin(angleRad), z: 0 };

  return (
    <>
      <Line points={[[0, 0, 0], [RIGHT_TRIANGLE_TRIG_HYPOTENUSE + 0.3, 0, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[0, 0, 0], tip]} color="orange" lineWidth={3} />
      <Line points={[foot, tip]} color="#4ade80" lineWidth={3} />
      <Line points={[[0, 0, 0], foot]} color="#38bdf8" lineWidth={3} />

      <DraggablePoint
        position={handlePosition}
        color="#FFD166"
        id="trigAngle"
        label={objectLabels.trigAngle}
        onChange={(p) => {
          setRightTriangleTrigInput(onAngle(p));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
