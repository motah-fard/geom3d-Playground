"use client";

import * as THREE from "three";
import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { HELICOID_TURNS, helicoidPoint, localHelicoid } from "@/lib/local-geometry";

const U_STEPS = 36;
const V_STEPS = 140;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// The pitch point is drawn just outside the ribbon's outer edge, at a
// fixed horizontal offset — only its height (z) feeds the math.
function pitchAxis(p: Vec3, radius: number): Vec3 {
  return { x: radius + 0.7, y: 0, z: p.z };
}

function buildHelicoidGeometry(radius: number, c: number): THREE.BufferGeometry {
  const totalAngle = HELICOID_TURNS * 2 * Math.PI;
  const positions: number[] = [];
  const stride = V_STEPS + 1;
  for (let i = 0; i <= U_STEPS; i++) {
    const u = (i / U_STEPS) * radius;
    for (let j = 0; j <= V_STEPS; j++) {
      const v = (j / V_STEPS) * totalAngle;
      const p = helicoidPoint(u, v, c);
      positions.push(p.x, p.y, p.z);
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < U_STEPS; i++) {
    for (let j = 0; j < V_STEPS; j++) {
      const a = i * stride + j;
      const b = a + stride;
      const c2 = a + 1;
      const d = b + 1;
      indices.push(a, b, c2, c2, b, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function outerEdgeCurve(radius: number, c: number): [number, number, number][] {
  const totalAngle = HELICOID_TURNS * 2 * Math.PI;
  const points: [number, number, number][] = [];
  for (let j = 0; j <= V_STEPS; j++) {
    const v = (j / V_STEPS) * totalAngle;
    const p = helicoidPoint(radius, v, c);
    points.push([p.x, p.y, p.z]);
  }
  return points;
}

export function HelicoidScene() {
  const { helicoidRadius, helicoidPitch, setHelicoidInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const radiusPoint = onAxis(helicoidRadius);
  const { radius, c } = localHelicoid(radiusPoint, helicoidPitch);
  const pitchPoint = pitchAxis(helicoidPitch, radius);

  const geometry = buildHelicoidGeometry(radius, c);

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#a5f3fc" transparent opacity={0.55} side={THREE.DoubleSide} depthTest depthWrite={false} />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#a5f3fc" wireframe transparent opacity={0.3} />
      </mesh>

      <Line points={outerEdgeCurve(radius, c)} color="#64748b" lineWidth={1.5} />
      <Line points={[[radiusPoint.x, 0, 0], [0, 0, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[pitchPoint.x, 0, 0], pitchPoint.z >= 0 ? [pitchPoint.x, 0, pitchPoint.z] : [pitchPoint.x, 0, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />

      <DraggablePoint
        position={radiusPoint}
        color="hotpink"
        id="helicoidRadius"
        label={objectLabels.helicoidRadius}
        onChange={(p) => {
          setHelicoidInputs({ radiusPoint: onAxis(p), pitchPoint: helicoidPitch });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={pitchPoint}
        color="cyan"
        id="helicoidPitch"
        label={objectLabels.helicoidPitch}
        onChange={(p) => {
          setHelicoidInputs({ radiusPoint, pitchPoint: { x: 0, y: 0, z: p.z } });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
