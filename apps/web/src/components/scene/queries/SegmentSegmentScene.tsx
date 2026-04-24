"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { toTuple } from "@/types/geometry";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { useEffect } from "react";

export function SegmentSegmentScene() {
  const {
    segmentA1,
    segmentA2,
    segmentB1,
    segmentB2,
    segmentSegmentResult,
    setShouldAutoRun,
    setSegmentSegmentInputs,
    shouldAutoRun,
  } = usePlaygroundStore();
  useEffect(() => {
    if (!shouldAutoRun) return;

    const run = async () => {
      try {
        const res = await fetch(
          "http://localhost:8081/api/v1/queries/segment-segment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              a1: segmentA1,
              a2: segmentA2,
              b1: segmentB1,
              b2: segmentB2,
            }),
          },
        );

        const data = await res.json();

        usePlaygroundStore.getState().setSegmentSegmentResult(data);
      } catch (err: any) {
        usePlaygroundStore.getState().setError(err.message);
      } finally {
        setShouldAutoRun(false);
      }
    };

    run();
  }, [shouldAutoRun, segmentA1, segmentA2, segmentB1, segmentB2]);
  return (
    <>
      {/* 🔵 Segment A */}
      <Line
        points={[toTuple(segmentA1), toTuple(segmentA2)]}
        color="blue"
        lineWidth={2}
      />

      {/* 🔷 Segment B */}
      <Line
        points={[toTuple(segmentB1), toTuple(segmentB2)]}
        color="cyan"
        lineWidth={2}
      />

      {/* 🟢 Closest points + distance */}
      {segmentSegmentResult && (
        <>
          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(segmentSegmentResult.pointA)}
          >
            <meshStandardMaterial color="green" />
          </Sphere>

          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(segmentSegmentResult.pointB)}
          >
            <meshStandardMaterial color="yellow" />
          </Sphere>

          <Line
            points={[
              toTuple(segmentSegmentResult.pointA),
              toTuple(segmentSegmentResult.pointB),
            ]}
            color="orange"
            lineWidth={2}
          />
        </>
      )}
      <DraggablePoint
        position={segmentA1}
        color="blue"
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
        color="blue"
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
        color="cyan"
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
        color="cyan"
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
