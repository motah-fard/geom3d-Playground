"use client";

import * as THREE from "three";
import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import {
  localMilkCoronet,
  milkCoronetSpikeAngle,
  MILK_CORONET_CRATER_DEPTH,
  MILK_CORONET_MIN_POINTS,
  MILK_CORONET_SPIKE_HEIGHT,
} from "@/lib/local-geometry";

const CRATER_SAMPLES = 32;
const RING_SAMPLES = 64;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// N is rendered off to the side (negative z) so it never collides with
// the crown; only its distance from the origin is meaningful.
function countAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), MILK_CORONET_MIN_POINTS), y: 0, z: -3.6 };
}

function craterGeometry(radius: number): THREE.LatheGeometry {
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= CRATER_SAMPLES; i++) {
    const r = (i / CRATER_SAMPLES) * radius;
    const z = -MILK_CORONET_CRATER_DEPTH * (1 - (r / radius) * (r / radius));
    profile.push(new THREE.Vector2(r, z));
  }
  return new THREE.LatheGeometry(profile, 48);
}

function ringPoints(radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / RING_SAMPLES;
    points.push([radius * Math.cos(theta), radius * Math.sin(theta), 0]);
  }
  return points;
}

export function MilkCoronetScene() {
  const { milkRadius, milkCount, setMilkCoronetInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const radiusPoint = onAxis(milkRadius);
  const countPoint = countAxis(milkCount);
  const { radius, points } = localMilkCoronet(radiusPoint, countPoint);

  const spikeTips: [number, number, number][] = [];
  for (let i = 0; i < points; i++) {
    const theta = milkCoronetSpikeAngle(i, points);
    spikeTips.push([radius * Math.cos(theta), radius * Math.sin(theta), 0]);
  }

  return (
    <>
      <mesh geometry={craterGeometry(radius)} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {spikeTips.map(([x, y], i) => (
        <mesh key={i} position={[x, y, MILK_CORONET_SPIKE_HEIGHT / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.13, MILK_CORONET_SPIKE_HEIGHT, 10]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* the inscribed N-gon connecting the crown points */}
      <Line points={[...spikeTips, spikeTips[0]]} color="orange" lineWidth={2} />
      {/* the smooth circle the polygon is approximating */}
      <Line points={ringPoints(radius)} color="#64748b" lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />

      <DraggablePoint
        position={radiusPoint}
        color="#FFD166"
        id="milkRadius"
        label={objectLabels.milkRadius}
        onChange={(p) => {
          setMilkCoronetInputs({ radiusPoint: onAxis(p), countPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={countPoint}
        color="#29C7E8"
        id="milkCount"
        label={objectLabels.milkCount}
        onChange={(p) => {
          setMilkCoronetInputs({ radiusPoint, countPoint: countAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
