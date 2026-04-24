"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import * as THREE from "three";
import { toTuple } from "@/types/geometry";

export function PointToPlaneScene() {
  const {
    point,
    planePoint,
    planeNormal,
    setInputs,
    setShouldAutoRun,
    projectPointResult,
    stepMode,
  } = usePlaygroundStore();

  // normalize normal (important or plane behaves weirdly)
  const normal = new THREE.Vector3(
    planeNormal.x,
    planeNormal.y,
    planeNormal.z,
  ).normalize();

  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    normal,
    new THREE.Vector3(planePoint.x, planePoint.y, planePoint.z),
  );

  const planePosition = plane.coplanarPoint(new THREE.Vector3());

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal,
  );

  return (
    <>
      <axesHelper args={[5]} />
      {/* 🔴 draggable point */}
      <DraggablePoint
        position={point}
        color="hotpink"
        onChange={(p) => {
          setInputs({
            point: p,
            planePoint,
            planeNormal,
          });
          setShouldAutoRun(true);
        }}
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

      {/* 🟢 projected point + 🟠 distance */}
      {projectPointResult && projectPointResult.projectedPoint && (
        <>
          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(projectPointResult.projectedPoint)} // ✅ FIXED
          >
            <meshStandardMaterial
              color="cyan"
              emissive="cyan"
              emissiveIntensity={0.5}
            />
          </Sphere>

          {stepMode && (
            <Line
              points={[
                toTuple(point),
                toTuple(projectPointResult.projectedPoint),
              ]}
              color="orange"
            />
          )}
          {stepMode && (
            <Line
              points={[
                toTuple(planePoint),
                toTuple({
                  x: planePoint.x + planeNormal.x,
                  y: planePoint.y + planeNormal.y,
                  z: planePoint.z + planeNormal.z,
                }),
              ]}
              color="purple"
            />
          )}
        </>
      )}
    </>
  );
}
