"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { CATENARY_HALF_SPAN, catenaryPoint, localCatenary } from "@/lib/local-geometry";

const SAMPLES = 80;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function CatenaryScene() {
  const { catenaryA, setCatenaryInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const aPoint = onAxis(catenaryA);
  const { a, sag } = localCatenary(aPoint, CATENARY_HALF_SPAN);

  const curve: [number, number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = -CATENARY_HALF_SPAN + (2 * CATENARY_HALF_SPAN * i) / SAMPLES;
    curve.push(toTuple(catenaryPoint(x, a)));
  }

  return (
    <>
      <Line points={curve} color="orange" lineWidth={2.5} />

      {/* fixed anchors at each end of the span */}
      <Sphere args={[0.12, 16, 16]} position={[-CATENARY_HALF_SPAN, sag, 0]}>
        <meshStandardMaterial color="#64748b" depthTest depthWrite />
      </Sphere>
      <Sphere args={[0.12, 16, 16]} position={[CATENARY_HALF_SPAN, sag, 0]}>
        <meshStandardMaterial color="#64748b" depthTest depthWrite />
      </Sphere>

      <DraggablePoint
        position={aPoint}
        color="hotpink"
        id="catenaryA"
        label={objectLabels.catenaryA}
        onChange={(p) => {
          setCatenaryInput(onAxis(p));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
