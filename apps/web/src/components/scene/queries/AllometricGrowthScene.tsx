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

function ring(radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / RING_SAMPLES;
    points.push([radius * Math.cos(theta), radius * Math.sin(theta), 0]);
  }
  return points;
}

export function AllometricGrowthScene() {
  const { allometrySize, allometryExponent, setAllometryInputs, setShouldAutoRun, objectLabels, showComparison, past, queryType } = usePlaygroundStore();

  const sizePoint = onAxis(allometrySize);
  const exponentPoint = exponentAxis(allometryExponent);
  const { x, y } = localAllometricGrowth(sizePoint, exponentPoint);

  const previous = past[past.length - 1];
  const showGhost = showComparison && previous?.queryType === queryType;
  const ghostSize = showGhost ? onAxis(previous.allometrySize) : null;
  const ghostExponent = showGhost ? exponentAxis(previous.allometryExponent) : null;
  const ghost = ghostSize && ghostExponent ? localAllometricGrowth(ghostSize, ghostExponent) : null;

  return (
    <>
      {ghost && (
        <>
          {/* ghost: previous checkpoint, 15% opacity */}
          <Line points={ring(ghost.x)} color="#475569" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} transparent opacity={0.15} />
          <Sphere args={[ghost.y, 32, 32]}>
            <meshStandardMaterial color="#f87171" transparent opacity={0.15} depthTest depthWrite={false} />
          </Sphere>
        </>
      )}

      {/* body-size reference ring, radius x */}
      <Line points={ring(x)} color="#475569" lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />

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
