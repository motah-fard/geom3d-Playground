"use client";

import { Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import * as THREE from "three";
import { toTuple } from "@/types/geometry";
import { MeasurementLine } from "../primitives/MeasurementLine";
import { VectorArrow } from "../primitives/VectorArrow";

export function PointToPlaneScene() {
  const {
    point,
    planePoint,
    planeNormal,
    setInputs,
    setShouldAutoRun,
    projectPointResult,
    stepMode,
    objectLabels,
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
      {/* 🔴 draggable point */}
      <DraggablePoint
        position={point}
        color="#FFD166"
        id="point"
        label={objectLabels.point}
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
      <VectorArrow origin={planePoint} direction={planeNormal} length={2.5} color="#7C83FF" />

      {/* 🟢 projected point + 🟠 distance */}
      {projectPointResult && projectPointResult.projectedPoint && (
        <>
          <Sphere
            args={[0.25, 32, 32]}
            position={toTuple(projectPointResult.projectedPoint)} // ✅ FIXED
          >
            <meshStandardMaterial
              color="#29C7E8"
              emissive="cyan"
              emissiveIntensity={0.5}
            />
          </Sphere>

          {stepMode && <MeasurementLine start={point} end={projectPointResult.projectedPoint} label="d" />}
        </>
      )}
    </>
  );
}
