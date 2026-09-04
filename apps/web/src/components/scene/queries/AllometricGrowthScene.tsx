"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { localAllometricGrowth } from "@/lib/local-geometry";

const RING_SAMPLES = 64;

// The size point X only ever moves along the positive X axis at z = 0.
function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// The exponent point K is rendered on its own axis, offset well clear of
// the body ring and part sphere (which both live around the origin at
// z = 0), so the two controls never visually collide.
function exponentAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: -3 };
}

export function AllometricGrowthScene() {
  const { allometrySize, allometryExponent, setAllometryInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const sizePoint = onAxis(allometrySize);
  const exponentPoint = exponentAxis(allometryExponent);
  const { x, y } = localAllometricGrowth(sizePoint, exponentPoint);

  const ring: [number, number, number][] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / RING_SAMPLES;
    ring.push([x * Math.cos(theta), x * Math.sin(theta), 0]);
  }

  return (
    <>
      {/* body-size reference ring, radius x */}
      <Line points={ring} color="#475569" lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />

      {/* the part, radius y */}
      <Sphere args={[y, 32, 32]}>
        <meshStandardMaterial color="#f87171" transparent opacity={0.5} depthTest depthWrite />
      </Sphere>

      <DraggablePoint
        position={sizePoint}
        color="#FFD166"
        id="allometrySize"
        label={objectLabels.allometrySize}
        onChange={(p) => {
          setAllometryInputs({ sizePoint: onAxis(p), exponentPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={exponentPoint}
        color="#29C7E8"
        id="allometryExponent"
        label={objectLabels.allometryExponent}
        onChange={(p) => {
          setAllometryInputs({ sizePoint, exponentPoint: exponentAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
