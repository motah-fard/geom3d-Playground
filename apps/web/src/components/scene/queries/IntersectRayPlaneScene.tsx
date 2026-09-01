"use client";

import { Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import * as THREE from "three";
import { toTuple } from "@/types/geometry";
import { VectorArrow } from "../primitives/VectorArrow";
import { MeasurementLine } from "../primitives/MeasurementLine";

export function IntersectRayPlaneScene() {
  const {
    rayOrigin,
    rayDir,
    planePoint,
    planeNormal,
    rayPlaneResult,
    setRayInputs,
    setShouldAutoRun,
    objectLabels,
  } = usePlaygroundStore();

  // normalize direction & normal (VERY important)
  const normal = new THREE.Vector3(
    planeNormal.x,
    planeNormal.y,
    planeNormal.z
  ).normalize();

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
        id="rayOrigin"
        label={objectLabels.rayOrigin}
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
      <VectorArrow origin={rayOrigin} direction={rayDir} length={10} />

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
      <VectorArrow origin={planePoint} direction={planeNormal} length={2.5} color="#c084fc" />

      {/* 🟢 intersection (ONLY if hit) */}
      {rayPlaneResult?.hit && (
        <>
          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(rayPlaneResult.point)}
          >
            <meshStandardMaterial color="blue" depthTest depthWrite />
          </Sphere>

          {/* 🟠 line from origin to intersection */}
          <MeasurementLine start={rayOrigin} end={rayPlaneResult.point} label="t" />
        </>
      )}
    </>
  );
}
