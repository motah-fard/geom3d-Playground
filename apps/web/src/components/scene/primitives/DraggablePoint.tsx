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

        // Drag along a plane parallel to the camera-facing XY plane, at
        // the point's own current depth — not a hardcoded Z=0, which
        // would silently flatten any point that starts off the ground
        // plane (most of the default ray/segment examples do).
        const newX = e.point.x;
        const newY = e.point.y;

        if (!isFinite(newX) || !isFinite(newY)) return;

        onChange({ x: newX, y: newY, z: position.z });
      }}
      onPointerOver={() => (document.body.style.cursor = "grab")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} depthTest depthWrite/>
    </mesh>
  );
}