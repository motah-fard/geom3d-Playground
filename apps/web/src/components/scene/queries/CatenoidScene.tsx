"use client";

import * as THREE from "three";
import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { CATENOID_HALF_HEIGHT, catenoidRadius, localCatenoid } from "@/lib/local-geometry";

const PROFILE_SAMPLES = 40;
const RING_SAMPLES = 48;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

function ringPoints(z: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / RING_SAMPLES;
    points.push([radius * Math.cos(theta), radius * Math.sin(theta), z]);
  }
  return points;
}

export function CatenoidScene() {
  const { catenoidA, setCatenoidInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const aPoint = onAxis(catenoidA);
  const { a, rimRadius } = localCatenoid(aPoint);

  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= PROFILE_SAMPLES; i++) {
    const z = -CATENOID_HALF_HEIGHT + (2 * CATENOID_HALF_HEIGHT * i) / PROFILE_SAMPLES;
    profile.push(new THREE.Vector2(catenoidRadius(z, a), z));
  }
  // LatheGeometry revolves around the local Y axis; rotate the mesh so
  // that axis becomes world Z, matching this app's height convention.
  const geometry = new THREE.LatheGeometry(profile, 48);

  return (
    <>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.45} side={THREE.DoubleSide} depthTest depthWrite={false} />
      </mesh>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.35} />
      </mesh>

      {/* the two rings the film spans */}
      <Line points={ringPoints(CATENOID_HALF_HEIGHT, rimRadius)} color="#64748b" lineWidth={1.5} />
      <Line points={ringPoints(-CATENOID_HALF_HEIGHT, rimRadius)} color="#64748b" lineWidth={1.5} />

      {/* waist marker */}
      <Sphere args={[0.07, 16, 16]} position={[a, 0, 0]}>
        <meshStandardMaterial color="#64748b" depthTest depthWrite />
      </Sphere>

      <DraggablePoint
        position={aPoint}
        color="hotpink"
        id="catenoidA"
        label={objectLabels.catenoidA}
        onChange={(p) => {
          setCatenoidInput(onAxis(p));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
