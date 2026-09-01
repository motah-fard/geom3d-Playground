"use client";

import { Box, Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { toTuple, type Vec3, type Vec3Tuple } from "@/types/geometry";
import { DraggablePoint } from "../primitives/DraggablePoint";

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

export function ClosestPointAABBScene() {
  const {
    point,
    aabbMin,
    aabbMax,
    closestPointAABBResult,
    setClosestPointAABBInputs,
    setShouldAutoRun,
  } = usePlaygroundStore();

  const { center, size } = boxCenterAndSize(aabbMin, aabbMax);

  return (
    <>
      <axesHelper args={[5]} />

      <DraggablePoint
        position={point}
        color="hotpink"
        onChange={(p) => {
          setClosestPointAABBInputs({ point: p, aabbMin, aabbMax });
          setShouldAutoRun(true);
        }}
      />

      <Box args={size} position={center}>
        <meshStandardMaterial color="lightgray" transparent opacity={0.3} />
      </Box>

      {closestPointAABBResult && (
        <>
          <Sphere args={[0.2, 32, 32]} position={toTuple(closestPointAABBResult.point)}>
            <meshStandardMaterial color="green" />
          </Sphere>

          <Line
            points={[toTuple(point), toTuple(closestPointAABBResult.point)]}
            color="orange"
            lineWidth={2}
          />
        </>
      )}
    </>
  );
}
