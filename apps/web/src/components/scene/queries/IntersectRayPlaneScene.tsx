"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import * as THREE from "three";
import { toTuple, Vec3Tuple } from "@/types/geometry";

export function IntersectRayPlaneScene() {
  const {
    rayOrigin,
    rayDir,
    planePoint,
    planeNormal,
    rayPlaneResult,
    setRayInputs,
    setShouldAutoRun,
  } = usePlaygroundStore();

  // normalize direction & normal (VERY important)
  const dir = new THREE.Vector3(rayDir.x, rayDir.y, rayDir.z).normalize();
  const normal = new THREE.Vector3(
    planeNormal.x,
    planeNormal.y,
    planeNormal.z
  ).normalize();

  // create a long ray line
  const rayEnd: Vec3Tuple = [
  rayOrigin.x + dir.x * 10,
  rayOrigin.y + dir.y * 10,
  rayOrigin.z + dir.z * 10,
];

  // plane transform
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    normal,
    new THREE.Vector3(planePoint.x, planePoint.y, planePoint.z)
  );

  const planePosition = plane.coplanarPoint(new THREE.Vector3());

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal
  );

  return (
    <>
      {/* 🔴 draggable ray origin */}
      <DraggablePoint
        position={rayOrigin}
        color="hotpink"
        onChange={(p) => {
          setRayInputs({
            rayOrigin: p,
            rayDir,
            planePoint,
            planeNormal,
          });
          setShouldAutoRun(true);
        }}
      />

      {/* 🔵 ray line */}
      <Line
        points={[toTuple(rayOrigin), rayEnd]}
        color="blue"
        lineWidth={2}
      />

      {/* 🧱 plane */}
      <mesh position={planePosition} quaternion={quaternion}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="lightgray"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 🟢 intersection (ONLY if hit) */}
      {rayPlaneResult?.hit && (
        <>
          <Sphere
            args={[0.25, 32, 32]}
            position={rayEnd}
          >
            <meshStandardMaterial color="blue" depthTest depthWrite />
          </Sphere>

          {/* 🟠 line from origin to intersection */}
          <Line
            points={[
                toTuple(rayOrigin),
                toTuple(rayPlaneResult.point),
            ]}
            color="orange"
            lineWidth={2}
          />
        </>
      )}
    </>
  );
}