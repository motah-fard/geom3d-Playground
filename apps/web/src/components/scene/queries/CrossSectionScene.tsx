"use client";

import * as THREE from "three";
import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { CROSS_SECTION_CONE_HALF_ANGLE, crossSectionCurvePoints, localCrossSection } from "@/lib/local-geometry";

const CONE_HEIGHT = 4;
const PLANE_HALF_WIDTH = 4.5;

function nappeGeometry(): THREE.ConeGeometry {
  const radius = CONE_HEIGHT * Math.tan(CROSS_SECTION_CONE_HALF_ANGLE * (Math.PI / 180));
  const geometry = new THREE.ConeGeometry(radius, CONE_HEIGHT, 48, 1, true);
  geometry.translate(0, -CONE_HEIGHT / 2, 0);
  return geometry;
}

function planeGeometry(m: number, c: number): THREE.BufferGeometry {
  const w = PLANE_HALF_WIDTH;
  const positions = new Float32Array([
    -w, -w, m * -w + c,
    w, -w, m * -w + c,
    w, w, m * w + c,
    -w, -w, m * -w + c,
    w, w, m * w + c,
    -w, w, m * w + c,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function tiltPoint(deg: number, radius: number): Vec3 {
  const rad = (deg * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: radius * Math.sin(rad), z: -1.5 };
}

function onOffsetAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 0.4), y: 0, z: -3 };
}

const TILT_DIAL_RADIUS = 1.6;

export function CrossSectionScene() {
  const { crossSectionTilt, crossSectionOffset, setCrossSectionInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const result = localCrossSection(CROSS_SECTION_CONE_HALF_ANGLE, crossSectionTilt, crossSectionOffset);
  const m = Math.tan(result.planeTiltDeg * (Math.PI / 180));
  const runs = crossSectionCurvePoints(CROSS_SECTION_CONE_HALF_ANGLE, result.planeTiltDeg, result.planeOffset);

  const nappeGeo = nappeGeometry();
  const tiltHandlePos = tiltPoint(result.planeTiltDeg, TILT_DIAL_RADIUS);
  const offsetHandlePos = onOffsetAxis(crossSectionOffset);

  return (
    <>
      <mesh geometry={nappeGeo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={nappeGeo} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh geometry={planeGeometry(m, result.planeOffset)}>
        <meshStandardMaterial color="#f472b6" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {runs.map((run, i) => (
        <Line key={i} points={run.map((p): [number, number, number] => [p.x, p.y, p.z])} color="orange" lineWidth={3} />
      ))}

      <DraggablePoint
        position={tiltHandlePos}
        color="hotpink"
        id="crossSectionTilt"
        label={objectLabels.crossSectionTilt}
        onChange={(p) => {
          setCrossSectionInputs({ tiltPoint: p, offsetPoint: crossSectionOffset });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={offsetHandlePos}
        color="cyan"
        id="crossSectionOffset"
        label={objectLabels.crossSectionOffset}
        onChange={(p) => {
          setCrossSectionInputs({ tiltPoint: crossSectionTilt, offsetPoint: onOffsetAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
