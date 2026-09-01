"use client";

import { Box, Edges, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { toTuple, type Vec3, type Vec3Tuple } from "@/types/geometry";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { VectorArrow } from "../primitives/VectorArrow";
import { MeasurementLine } from "../primitives/MeasurementLine";

function boxCenterAndSize(min: Vec3, max: Vec3): { center: Vec3Tuple; size: Vec3Tuple } {
  return {
    center: [(min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2],
    size: [
      Math.abs(max.x - min.x),
      Math.abs(max.y - min.y),
      Math.abs(max.z - min.z),
    ],
  };
}

export function IntersectRayAABBScene() {
  const {
    rayOrigin,
    rayDir,
    aabbMin,
    aabbMax,
    rayAABBResult,
    setRayAABBInputs,
    setShouldAutoRun,
    objectLabels,
  } = usePlaygroundStore();

  const { center, size } = boxCenterAndSize(aabbMin, aabbMax);

  return (
    <>
      <DraggablePoint
        position={rayOrigin}
        color="hotpink"
        id="rayOrigin"
        label={objectLabels.rayOrigin}
        onChange={(p) => {
          setRayAABBInputs({ rayOrigin: p, rayDir, aabbMin, aabbMax });
          setShouldAutoRun(true);
        }}
      />

      <VectorArrow origin={rayOrigin} direction={rayDir} length={10} />

      <Box args={size} position={center}>
        <meshStandardMaterial color="lightgray" transparent opacity={0.3} />
        <Edges color="#94a3b8" />
      </Box>

      {rayAABBResult?.hit && (
        <>
          <Sphere args={[0.2, 32, 32]} position={toTuple(rayAABBResult.point)}>
            <meshStandardMaterial color="blue" />
          </Sphere>

          <MeasurementLine start={rayOrigin} end={rayAABBResult.point} label="entry" />
        </>
      )}
    </>
  );
}
