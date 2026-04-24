"use client";

import { toTuple } from "@/types/geometry";
import { useState } from "react";

export function DraggablePoint({
  position,
  onChange,
  color = "hotpink",
}: {
  position: { x: number; y: number; z: number };
  onChange: (p: { x: number; y: number; z: number }) => void;
  color?: string;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <mesh
      position={toTuple(position)}
      onPointerDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        setDragging(false);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;

        e.stopPropagation();

        // lock to XY plane for sanity
        const newX = e.point.x;
        const newY = e.point.y;

        if (!isFinite(newX) || !isFinite(newY)) return;

        onChange({ x: newX, y: newY, z: 0 });
      }}
      onPointerOver={() => (document.body.style.cursor = "grab")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} depthTest depthWrite/>
    </mesh>
  );
}