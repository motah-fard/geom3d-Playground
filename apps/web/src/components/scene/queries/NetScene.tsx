"use client";

import * as THREE from "three";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { foldCubeNet, localNet } from "@/lib/local-geometry";

const FACE_COLORS: Record<"base" | "north" | "south" | "east" | "west" | "top", string> = {
  base: "#f472b6",
  north: "#38bdf8",
  south: "#4ade80",
  east: "#facc15",
  west: "#a78bfa",
  top: "#fb923c",
};

function quadGeometry(vertices: Vec3[]): THREE.BufferGeometry {
  const [a, b, c, d] = vertices;
  const positions = new Float32Array([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

const HANDLE_TRAVEL = 2;

function handlePosition(foldFraction: number): Vec3 {
  return { x: -3.2, y: 0, z: foldFraction * HANDLE_TRAVEL };
}

export function NetScene() {
  const { netFold, setNetInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { side, foldFraction } = localNet(netFold);
  const faces = foldCubeNet(side, foldFraction);

  return (
    <>
      {(Object.keys(faces) as Array<keyof typeof faces>).map((key) => (
        <mesh key={key} geometry={quadGeometry(faces[key])}>
          <meshStandardMaterial color={FACE_COLORS[key]} side={THREE.DoubleSide} transparent opacity={0.92} />
        </mesh>
      ))}
      {(Object.keys(faces) as Array<keyof typeof faces>).map((key) => (
        <mesh key={`${key}-wire`} geometry={quadGeometry(faces[key])}>
          <meshStandardMaterial color="#0f172a" wireframe />
        </mesh>
      ))}

      <DraggablePoint
        position={handlePosition(foldFraction)}
        color="hotpink"
        id="netFold"
        label={objectLabels.netFold}
        onChange={(p) => {
          const clamped = Math.max(0, Math.min(HANDLE_TRAVEL, p.z)) / HANDLE_TRAVEL;
          setNetInput({ x: clamped, y: 0, z: 0 });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
