"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { localRegularPolygon, REGULAR_POLYGON_MIN_SIDES, regularPolygonVertex } from "@/lib/local-geometry";

const CIRCLE_SAMPLES = 96;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// N is rendered off to the side so it never collides with the polygon.
function countAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), REGULAR_POLYGON_MIN_SIDES), y: 0, z: -3 };
}

export function RegularPolygonScene() {
  const { polygonSides, polygonRadius, setRegularPolygonInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const sidesPoint = countAxis(polygonSides);
  const radiusPoint = onAxis(polygonRadius);
  const { sides, circumradius } = localRegularPolygon(sidesPoint, radiusPoint);

  const polygonPoints: [number, number, number][] = [];
  for (let i = 0; i <= sides; i++) {
    const v = regularPolygonVertex(i % sides, sides, circumradius);
    polygonPoints.push([v.x, v.y, 0]);
  }

  const circlePoints: [number, number, number][] = [];
  for (let i = 0; i <= CIRCLE_SAMPLES; i++) {
    const t = (2 * Math.PI * i) / CIRCLE_SAMPLES;
    circlePoints.push([circumradius * Math.cos(t), circumradius * Math.sin(t), 0]);
  }

  return (
    <>
      <Line points={circlePoints} color="#64748b" lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />
      <Line points={polygonPoints} color="orange" lineWidth={2.5} />

      <DraggablePoint
        position={radiusPoint}
        color="#FFD166"
        id="polygonRadius"
        label={objectLabels.polygonRadius}
        onChange={(p) => {
          setRegularPolygonInputs({ sidesPoint, radiusPoint: onAxis(p) });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={sidesPoint}
        color="#29C7E8"
        id="polygonSides"
        label={objectLabels.polygonSides}
        onChange={(p) => {
          setRegularPolygonInputs({ sidesPoint: countAxis(p), radiusPoint });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
