"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple } from "@/types/geometry";

export function ClosestPointSegmentScene() {
  const {
    point,
    segmentA,
    segmentB,
    segmentResult,
    setSegmentInputs,
    setShouldAutoRun,
  } = usePlaygroundStore();

  return (
    <>
      <axesHelper args={[5]} />
      {/* 🔴 draggable point */}
      <DraggablePoint
        position={point}
        color="hotpink"
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
        color="blue"
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
        color="blue"
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
        color="blue"
        lineWidth={2}
      />

      {/* 🟢 closest point + orange distance */}
      {segmentResult?.point && (
        <>
          <Sphere args={[0.25, 32, 32]} position={toTuple(segmentResult.point)}>
            <meshStandardMaterial color="green" depthTest depthWrite />
          </Sphere>

          <Line
            points={[toTuple(segmentResult.point), toTuple(point)]}
            color="orange"
            lineWidth={2}
          />
        </>
      )}
    </>
  );
}
