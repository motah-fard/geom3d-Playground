"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { localPythagorean } from "@/lib/local-geometry";

function onAxisX(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}
function onAxisY(p: Vec3): Vec3 {
  return { x: 0, y: Math.max(Math.hypot(p.x, p.y), 1e-6), z: 0 };
}

function squareLoop(points: [number, number][]): [number, number, number][] {
  return [...points, points[0]].map(([x, y]) => [x, y, 0]);
}

export function PythagoreanScene() {
  const { pythagoreanLegA, pythagoreanLegB, setPythagoreanInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const legAPoint = onAxisX(pythagoreanLegA);
  const legBPoint = onAxisY(pythagoreanLegB);
  const { legA, legB, hypotenuse } = localPythagorean(legAPoint, legBPoint);

  const p1: [number, number] = [legA, 0];
  const p2: [number, number] = [0, legB];
  // outward unit normal to the hypotenuse, pointing away from the origin
  const nx = legB / hypotenuse;
  const ny = legA / hypotenuse;

  const squareA = squareLoop([[0, 0], [legA, 0], [legA, -legA], [0, -legA]]);
  const squareB = squareLoop([[0, 0], [0, legB], [-legB, legB], [-legB, 0]]);
  const squareC = squareLoop([
    p1,
    p2,
    [p2[0] + nx * hypotenuse, p2[1] + ny * hypotenuse],
    [p1[0] + nx * hypotenuse, p1[1] + ny * hypotenuse],
  ]);

  return (
    <>
      <Line points={[[0, 0, 0], [legA, 0, 0]]} color="#94a3b8" lineWidth={3} />
      <Line points={[[0, 0, 0], [0, legB, 0]]} color="#94a3b8" lineWidth={3} />
      <Line points={[[legA, 0, 0], [0, legB, 0]]} color="orange" lineWidth={3} />

      <Line points={squareA} color="#4ade80" lineWidth={1.5} />
      <Line points={squareB} color="#38bdf8" lineWidth={1.5} />
      <Line points={squareC} color="#f472b6" lineWidth={1.5} />

      <DraggablePoint
        position={legAPoint}
        color="#FFD166"
        id="pythagoreanLegA"
        label={objectLabels.pythagoreanLegA}
        onChange={(p) => {
          setPythagoreanInputs({ legAPoint: onAxisX(p), legBPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={legBPoint}
        color="#29C7E8"
        id="pythagoreanLegB"
        label={objectLabels.pythagoreanLegB}
        onChange={(p) => {
          setPythagoreanInputs({ legAPoint, legBPoint: onAxisY(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
