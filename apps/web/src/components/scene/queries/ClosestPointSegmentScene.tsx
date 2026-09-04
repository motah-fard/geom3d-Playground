"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple } from "@/types/geometry";
import { MeasurementLine } from "../primitives/MeasurementLine";

export function ClosestPointSegmentScene() {
  const {
    point,
    segmentA,
    segmentB,
    segmentResult,
    setSegmentInputs,
    setShouldAutoRun,
    objectLabels,
  } = usePlaygroundStore();

  return (
    <>
      {/* 🔴 draggable point */}
      <DraggablePoint
        position={point}
        color="#FFD166"
        id="point"
        label={objectLabels.point}
        onChange={(p) => {
          setSegmentInputs({
            point: p,
            segmentA,
            segmentB,
          });
          setShouldAutoRun(true);
        }}
      />

      {/* 🔵 segment endpoints */}
      <DraggablePoint
        position={segmentA}
        color="#5B8CFF"
        id="segmentA"
        label={objectLabels.segmentA}
        onChange={(p) => {
          setSegmentInputs({
            point,
            segmentA: p,
            segmentB,
          });
          setShouldAutoRun(true);
        }}
      />

      <DraggablePoint
        position={segmentB}
        color="#5B8CFF"
        id="segmentB"
        label={objectLabels.segmentB}
        onChange={(p) => {
          setSegmentInputs({
            point,
            segmentA,
            segmentB: p,
          });
          setShouldAutoRun(true);
        }}
      />

      {/* 🔵 segment line */}
      <Line
        points={[toTuple(segmentA), toTuple(segmentB)]}
        color="#5B8CFF"
        lineWidth={2}
      />

      {/* 🟢 closest point + orange distance */}
      {segmentResult?.point && (
        <>
          <Sphere args={[0.25, 32, 32]} position={toTuple(segmentResult.point)}>
            <meshStandardMaterial color="#FF7AC8" depthTest depthWrite />
          </Sphere>

          <MeasurementLine start={segmentResult.point} end={point} />
        </>
      )}
    </>
  );
}
