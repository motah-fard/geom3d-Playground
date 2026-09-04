"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { localTransformations, TRANSFORM_BASE_TRIANGLE, transformTrianglePoint } from "@/lib/local-geometry";

function triangleLoop(points: readonly { x: number; y: number }[]): [number, number, number][] {
  return [...points, points[0]].map((p) => [p.x, p.y, 0]);
}

export function TransformationsScene() {
  const { transformTranslation, transformHandle, setTransformationsInputs, setShouldAutoRun, objectLabels, showComparison, past, queryType } = usePlaygroundStore();

  const { translationX, translationY, rotationDeg, scale } = localTransformations(transformTranslation, transformHandle);
  const rotationRad = (rotationDeg * Math.PI) / 180;
  const translation = { x: translationX, y: translationY };
  const transformed = TRANSFORM_BASE_TRIANGLE.map((p) => transformTrianglePoint(p, translation, rotationRad, scale));

  const previous = past[past.length - 1];
  const showGhost = showComparison && previous?.queryType === queryType;
  const ghostTransformed = showGhost
    ? (() => {
        const { translationX: gx, translationY: gy, rotationDeg: gDeg, scale: gScale } = localTransformations(previous.transformTranslation, previous.transformHandle);
        const gRad = (gDeg * Math.PI) / 180;
        return TRANSFORM_BASE_TRIANGLE.map((p) => transformTrianglePoint(p, { x: gx, y: gy }, gRad, gScale));
      })()
    : null;

  return (
    <>
      <Line points={triangleLoop(TRANSFORM_BASE_TRIANGLE)} color="#64748b" lineWidth={2} dashed dashSize={0.12} gapSize={0.1} />
      {ghostTransformed && (
        <Line points={triangleLoop(ghostTransformed)} color="#29C7E8" lineWidth={2} transparent opacity={0.15} />
      )}
      <Line points={triangleLoop(transformed)} color="#29C7E8" lineWidth={3} />

      <DraggablePoint
        position={{ x: translationX, y: translationY, z: 0 }}
        color="#FFD166"
        id="transformTranslation"
        label={objectLabels.transformTranslation}
        onChange={(p) => {
          setTransformationsInputs({ translationPoint: p, handlePoint: transformHandle });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={transformHandle}
        color="#29C7E8"
        id="transformHandle"
        label={objectLabels.transformHandle}
        onChange={(p) => {
          setTransformationsInputs({ translationPoint: transformTranslation, handlePoint: p });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
