"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple } from "@/types/geometry";
import {
  DEFAULT_TRANSFORM_CORNERS,
  FISH_EYE,
  FISH_OUTLINE,
  bilinearPoint,
} from "@/lib/local-geometry";
import type { CartesianTransformCorners } from "@/types/geometry";

const VERTICAL_LINES = 7;
const HORIZONTAL_LINES = 5;

function gridLines(corners: CartesianTransformCorners) {
  const lines: Array<[[number, number, number], [number, number, number]]> = [];
  for (let i = 0; i < VERTICAL_LINES; i++) {
    const u = i / (VERTICAL_LINES - 1);
    lines.push([toTuple(bilinearPoint(u, 0, corners)), toTuple(bilinearPoint(u, 1, corners))]);
  }
  for (let j = 0; j < HORIZONTAL_LINES; j++) {
    const v = j / (HORIZONTAL_LINES - 1);
    lines.push([toTuple(bilinearPoint(0, v, corners)), toTuple(bilinearPoint(1, v, corners))]);
  }
  return lines;
}

export function CartesianTransformScene() {
  const { transformP00, transformP10, transformP01, transformP11, setTransformInputs, setShouldAutoRun, objectLabels } =
    usePlaygroundStore();

  const corners: CartesianTransformCorners = {
    p00: transformP00,
    p10: transformP10,
    p01: transformP01,
    p11: transformP11,
  };

  const updateCorner = (key: keyof CartesianTransformCorners) => (p: { x: number; y: number; z: number }) => {
    setTransformInputs({ ...corners, [key]: p });
    setShouldAutoRun(true);
  };

  const outline = FISH_OUTLINE.map(([u, v]) => toTuple(bilinearPoint(u, v, corners)));
  const referenceOutline = FISH_OUTLINE.map(([u, v]) => toTuple(bilinearPoint(u, v, DEFAULT_TRANSFORM_CORNERS)));
  const eye = toTuple(bilinearPoint(FISH_EYE[0], FISH_EYE[1], corners));

  return (
    <>
      {/* faint reference (undistorted) outline for comparison */}
      <Line points={[...referenceOutline, referenceOutline[0]]} color="#475569" lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />

      {/* warped growth grid */}
      {gridLines(corners).map((line, i) => (
        <Line key={i} points={line} color="#38bdf8" lineWidth={1} transparent opacity={0.55} />
      ))}

      {/* warped fish outline */}
      <Line points={[...outline, outline[0]]} color="orange" lineWidth={2.5} />
      <Sphere args={[0.08, 16, 16]} position={eye}>
        <meshStandardMaterial color="orange" depthTest depthWrite />
      </Sphere>

      {/* draggable corners */}
      <DraggablePoint position={transformP00} color="#FFD166" id="transformP00" label={objectLabels.transformP00} onChange={updateCorner("p00")} />
      <DraggablePoint position={transformP10} color="#FFD166" id="transformP10" label={objectLabels.transformP10} onChange={updateCorner("p10")} />
      <DraggablePoint position={transformP01} color="#FFD166" id="transformP01" label={objectLabels.transformP01} onChange={updateCorner("p01")} />
      <DraggablePoint position={transformP11} color="#FFD166" id="transformP11" label={objectLabels.transformP11} onChange={updateCorner("p11")} />
    </>
  );
}
