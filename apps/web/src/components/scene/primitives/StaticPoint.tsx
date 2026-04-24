"use client";

import { toTuple } from "@/types/geometry";
import { Sphere } from "@react-three/drei";

type Vec3 = { x: number; y: number; z: number };

export function StaticPoint({
  position,
  color = "black",
  size = 0.25,
}: {
  position: Vec3;
  color?: string;
  size?: number;
}) {
  return (
    <Sphere
      args={[size, 32, 32]}
      position={toTuple(position)}
    >
      <meshStandardMaterial color={color} depthTest depthWrite/>
    </Sphere>
  );
}