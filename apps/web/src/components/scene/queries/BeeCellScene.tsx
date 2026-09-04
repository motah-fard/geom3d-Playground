"use client";

import * as THREE from "three";
import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import {
  BEE_CELL_HEXAGON_SIDE,
  BEE_CELL_WALL_HEIGHT,
  beeCellApex,
  beeCellRimVertex,
  localBeeCell,
} from "@/lib/local-geometry";

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// The 6 neighboring cells a real honeycomb packs this one against — each
// hexagon's own center sits one apothem-and-a-half away from the last, in
// the direction perpendicular to the shared edge between them.
const NEIGHBOR_OFFSETS: [number, number][] = Array.from({ length: 6 }, (_, k) => {
  const angle = (Math.PI / 6) + (Math.PI / 3) * k;
  const distance = BEE_CELL_HEXAGON_SIDE * Math.sqrt(3);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
});

function push(positions: number[], p: Vec3) {
  positions.push(p.x, p.y, p.z);
}

function buildBeeCellGeometry(x: number, wallHeight: number): THREE.BufferGeometry {
  const rim = Array.from({ length: 6 }, (_, i) => beeCellRimVertex(i, x));
  const base = rim.map((v) => ({ x: v.x, y: v.y, z: -wallHeight }));
  const apex = beeCellApex(x);

  const positions: number[] = [];

  // 6 side-wall panels.
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    push(positions, rim[i]);
    push(positions, rim[next]);
    push(positions, base[next]);
    push(positions, rim[i]);
    push(positions, base[next]);
    push(positions, base[i]);
  }

  // 3 rhombic cap faces, one per trimmed (odd-index) corner.
  for (let k = 0; k < 6; k += 2) {
    const kept1 = rim[k];
    const trimmed = rim[(k + 1) % 6];
    const kept2 = rim[(k + 2) % 6];
    push(positions, kept1);
    push(positions, trimmed);
    push(positions, kept2);
    push(positions, kept1);
    push(positions, kept2);
    push(positions, apex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function ridgeLines(x: number): [number, number, number][][] {
  const apex = beeCellApex(x);
  const lines: [number, number, number][][] = [];
  for (let k = 0; k < 6; k += 2) {
    const kept = beeCellRimVertex(k, x);
    lines.push([
      [kept.x, kept.y, kept.z],
      [apex.x, apex.y, apex.z],
    ]);
  }
  return lines;
}

export function BeeCellScene() {
  const { beeCellRise, setBeeCellInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const risePoint = onAxis(beeCellRise);
  const { x, optimalX } = localBeeCell(risePoint);

  const geometry = buildBeeCellGeometry(x, BEE_CELL_WALL_HEIGHT);
  const isNearOptimal = Math.abs(x - optimalX) < 0.02;

  return (
    <>
      {/* the surrounding honeycomb — same cell, packed edge to edge, for context */}
      {NEIGHBOR_OFFSETS.map(([nx, ny], i) => (
        <mesh key={i} geometry={geometry} position={[nx, ny, 0]}>
          <meshStandardMaterial color="#fde047" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}

      <mesh geometry={geometry}>
        <meshStandardMaterial color="#fde047" transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#fde047" wireframe transparent opacity={0.3} />
      </mesh>

      {ridgeLines(x).map((points, i) => (
        <Line key={i} points={points} color={isNearOptimal ? "#4ade80" : "#64748b"} lineWidth={2} />
      ))}

      <DraggablePoint
        position={risePoint}
        color="#FFD166"
        id="beeCellRise"
        label={objectLabels.beeCellRise}
        onChange={(p) => {
          setBeeCellInput(onAxis(p));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
