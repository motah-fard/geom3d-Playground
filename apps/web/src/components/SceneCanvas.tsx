"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { usePlaygroundStore } from "@/store/playground-store";

function PointMarker({
  position,
  color = "orange",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.12, 24, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PlaneMesh() {
  const { planePoint, planeNormal } = usePlaygroundStore();

  const quaternion = useMemo(() => {
    const normal = new THREE.Vector3(
      planeNormal.x,
      planeNormal.y,
      planeNormal.z
    ).normalize();

    const defaultNormal = new THREE.Vector3(0, 0, 1);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(defaultNormal, normal);
    return q;
  }, [planeNormal]);

  return (
    <mesh
      position={[planePoint.x, planePoint.y, planePoint.z]}
      quaternion={quaternion}
    >
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial
        color="skyblue"
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function RayLine() {
  const { rayOrigin, rayDir } = usePlaygroundStore();

  const points = useMemo(() => {
    const origin: [number, number, number] = [rayOrigin.x, rayOrigin.y, rayOrigin.z];

    const dir = new THREE.Vector3(rayDir.x, rayDir.y, rayDir.z);
    if (dir.lengthSq() === 0) {
      return [origin, origin] as [number, number, number][];
    }

    dir.normalize();
    const end: [number, number, number] = [
      rayOrigin.x + dir.x * 8,
      rayOrigin.y + dir.y * 8,
      rayOrigin.z + dir.z * 8,
    ];

    return [origin, end];
  }, [rayOrigin, rayDir]);

  return <Line points={points} color="hotpink" lineWidth={2} />;
}

function SceneObjects() {
  const { queryType, point, result, rayOrigin, rayPlaneResult } = usePlaygroundStore();

  return (
    <>
      <PlaneMesh />

      {queryType === "project-point-to-plane" && (
        <>
          <PointMarker position={[point.x, point.y, point.z]} color="orange" />
          {result && (
            <PointMarker
              position={[
                result.projectedPoint.x,
                result.projectedPoint.y,
                result.projectedPoint.z,
              ]}
              color="limegreen"
            />
          )}
        </>
      )}

      {queryType === "intersect-ray-plane" && (
        <>
          <PointMarker position={[rayOrigin.x, rayOrigin.y, rayOrigin.z]} color="hotpink" />
          <RayLine />
          {rayPlaneResult?.hit && (
            <PointMarker
              position={[
                rayPlaneResult.point.x,
                rayPlaneResult.point.y,
                rayPlaneResult.point.z,
              ]}
              color="limegreen"
            />
          )}
        </>
      )}
    </>
  );
}

export function SceneCanvas() {
  return (
    <div className="h-[600px] w-full rounded-2xl border">
      <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Grid args={[20, 20]} cellSize={1} cellThickness={0.5} />
        <axesHelper args={[5]} />
        <SceneObjects />
        <OrbitControls />
      </Canvas>
    </div>
  );
}