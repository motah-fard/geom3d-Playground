"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { toTuple } from "@/types/geometry";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { MeasurementLine } from "../primitives/MeasurementLine";

export function SegmentSegmentScene() {
  const {
    segmentA1,
    segmentA2,
    segmentB1,
    segmentB2,
    segmentSegmentResult,
    setShouldAutoRun,
    setSegmentSegmentInputs,
    objectLabels,
  } = usePlaygroundStore();

  return (
    <>
      {/* 🔵 Segment A */}
      <Line
        points={[toTuple(segmentA1), toTuple(segmentA2)]}
        color="#5B8CFF"
        lineWidth={2}
      />

      {/* 🔷 Segment B */}
      <Line
        points={[toTuple(segmentB1), toTuple(segmentB2)]}
        color="#29C7E8"
        lineWidth={2}
      />

      {/* 🟢 Closest points + distance */}
      {segmentSegmentResult && (
        <>
          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(segmentSegmentResult.pointA)}
          >
            <meshStandardMaterial color="#FF7AC8" />
          </Sphere>

          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(segmentSegmentResult.pointB)}
          >
            <meshStandardMaterial color="#FF7AC8" />
          </Sphere>

          <MeasurementLine start={segmentSegmentResult.pointA} end={segmentSegmentResult.pointB} />
        </>
      )}
      <DraggablePoint
        position={segmentA1}
        color="#5B8CFF"
        id="segmentA1"
        label={objectLabels.segmentA1}
        onChange={(p) => {
          setSegmentSegmentInputs({
            a1: p,
            a2: segmentA2,
            b1: segmentB1,
            b2: segmentB2,
          });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={segmentA2}
        color="#5B8CFF"
        id="segmentA2"
        label={objectLabels.segmentA2}
        onChange={(p) => {
          setSegmentSegmentInputs({
            a1: segmentA1,
            a2: p,
            b1: segmentB1,
            b2: segmentB2,
          });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={segmentB1}
        color="#29C7E8"
        id="segmentB1"
        label={objectLabels.segmentB1}
        onChange={(p) => {
          setSegmentSegmentInputs({
            a1: segmentA1,
            a2: segmentA2,
            b1: p,
            b2: segmentB2,
          });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={segmentB2}
        color="#29C7E8"
        id="segmentB2"
        label={objectLabels.segmentB2}
        onChange={(p) => {
          setSegmentSegmentInputs({
            a1: segmentA1,
            a2: segmentA2,
            b1: segmentB1,
            b2: p,
          });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
