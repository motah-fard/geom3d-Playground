"use client";

import { toTuple } from "@/types/geometry";
import { Line } from "@react-three/drei";

type Vec3 = { x: number; y: number; z: number };

export function VectorLine({
  start,
  end,
  color = "blue",
  width = 2,
}: {
  start: Vec3;
  end: Vec3;
  color?: string;
  width?: number;
}) {
  return (
    <Line
      points={[toTuple(start), toTuple(end)]}
      color={color}
      lineWidth={width}
    />
  );
}
