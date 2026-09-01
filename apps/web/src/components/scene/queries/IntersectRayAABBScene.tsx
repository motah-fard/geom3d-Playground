"use client";

import { Box, Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { toTuple, type Vec3, type Vec3Tuple } from "@/types/geometry";
import { DraggablePoint } from "../primitives/DraggablePoint";
import * as THREE from "three";

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
  } = usePlaygroundStore();

  const dir = new THREE.Vector3(rayDir.x, rayDir.y, rayDir.z).normalize();
  const rayEnd: Vec3Tuple = [
    rayOrigin.x + dir.x * 10,
    rayOrigin.y + dir.y * 10,
    rayOrigin.z + dir.z * 10,
  ];

  const { center, size } = boxCenterAndSize(aabbMin, aabbMax);

  return (
    <>
      <axesHelper args={[5]} />

      <DraggablePoint
        position={rayOrigin}
        color="hotpink"
        onChange={(p) => {
          setRayAABBInputs({ rayOrigin: p, rayDir, aabbMin, aabbMax });
          setShouldAutoRun(true);
        }}
      />

      <Line points={[toTuple(rayOrigin), rayEnd]} color="blue" lineWidth={2} />

      <Box args={size} position={center}>
        <meshStandardMaterial color="lightgray" transparent opacity={0.3} />
      </Box>

      {rayAABBResult?.hit && (
        <>
          <Sphere args={[0.2, 32, 32]} position={toTuple(rayAABBResult.point)}>
            <meshStandardMaterial color="blue" />
          </Sphere>

          <Line
            points={[toTuple(rayOrigin), toTuple(rayAABBResult.point)]}
            color="orange"
            lineWidth={2}
          />
        </>
      )}
    </>
  );
}
