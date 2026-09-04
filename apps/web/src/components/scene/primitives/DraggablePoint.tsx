"use client";

import { toTuple } from "@/types/geometry";
import { Html, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { usePlaygroundStore } from "@/store/playground-store";

export function DraggablePoint({
  position,
  onChange,
  color = "#FFD166",
  label,
  id,
}: {
  position: { x: number; y: number; z: number };
  onChange: (p: { x: number; y: number; z: number }) => void;
  color?: string;
  label?: string;
  id: string;
}) {
  const [dragging, setDragging] = useState(false);
  const { camera } = useThree();
  const { setIsDragging, selectedObject, setSelectedObject, saveCheckpoint, snap, hoveredTerm } = usePlaygroundStore();
  const isHovered = hoveredTerm?.targetId === id;
  const dragPlane = useRef(new THREE.Plane());
  const meshRef = useRef<THREE.Mesh>(null);
  const hit = useRef(new THREE.Vector3());
  const start = useRef({ y: 0, position: new THREE.Vector3() });

  const endDrag = () => {
    setDragging(false);
    setIsDragging(false);
    document.body.style.cursor = "grab";
  };

  return (
    <>
    <mesh
      ref={meshRef}
      position={toTuple(position)}
      scale={selectedObject === id ? 1.18 : 1}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedObject(id);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        saveCheckpoint();
        setSelectedObject(id);
        (e.target as EventTarget & { setPointerCapture?: (id: number) => void })
          ?.setPointerCapture?.(e.pointerId);
        const normal = new THREE.Vector3();
        camera.getWorldDirection(normal);
        dragPlane.current.setFromNormalAndCoplanarPoint(
          normal,
          new THREE.Vector3(position.x, position.y, position.z),
        );
        start.current = {
          y: e.nativeEvent.clientY,
          position: new THREE.Vector3(position.x, position.y, position.z),
        };
        setDragging(true);
        setIsDragging(true);
        document.body.style.cursor = "grabbing";
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        (e.target as EventTarget & { releasePointerCapture?: (id: number) => void })
          ?.releasePointerCapture?.(e.pointerId);
        endDrag();
      }}
      onPointerCancel={endDrag}
      onPointerMove={(e) => {
        if (!dragging) return;
        e.stopPropagation();
        if (e.nativeEvent.shiftKey) {
          const delta = (start.current.y - e.nativeEvent.clientY) * 0.025;
          onChange({
            x: start.current.position.x,
            y: start.current.position.y,
            z: start.current.position.z + delta,
          });
          return;
        }
        const next = e.ray.intersectPlane(dragPlane.current, hit.current);
        if (!next || !Number.isFinite(next.x + next.y + next.z)) return;
        onChange({ x: next.x, y: next.y, z: next.z });
      }}
      onPointerOver={() => (document.body.style.cursor = "grab")}
      onPointerOut={() => {
        if (!dragging) document.body.style.cursor = "default";
      }}
    >
      <sphereGeometry args={[0.28, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={dragging || selectedObject === id ? 0.45 : isHovered ? 0.9 : 0.12} depthTest depthWrite />
      {isHovered && (
        <mesh scale={1.7}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      )}
      {isHovered && hoveredTerm && (
        <Html center position={[0, 1.35, 0]} style={{ pointerEvents: "none" }} zIndexRange={[100, 0]}>
          <div className="w-max max-w-[220px] rounded-lg border border-amber-300/40 bg-slate-950/95 px-2.5 py-1.5 text-center shadow-2xl">
            <p className="font-mono text-xs font-bold text-amber-200">{hoveredTerm.symbol} = {hoveredTerm.value}</p>
            <p className="mt-0.5 text-[10px] leading-4 text-slate-300">{hoveredTerm.meaning}</p>
          </div>
        </Html>
      )}
      {label && (
        <Html center position={[0, 0.55, 0]} style={{ pointerEvents: "auto" }}>
          <button
            type="button"
            aria-label={`${label} at x ${position.x}, y ${position.y}, z ${position.z}. Use arrow keys to move on X and Y; Page Up and Page Down move Z.`}
            onFocus={() => setSelectedObject(id)}
            onKeyDown={(event) => {
              const amount = event.shiftKey ? Math.max(1, snap) : snap || 0.1;
              const delta =
                event.key === "ArrowLeft" ? { x: -amount, y: 0, z: 0 } :
                event.key === "ArrowRight" ? { x: amount, y: 0, z: 0 } :
                event.key === "ArrowUp" ? { x: 0, y: amount, z: 0 } :
                event.key === "ArrowDown" ? { x: 0, y: -amount, z: 0 } :
                event.key === "PageUp" ? { x: 0, y: 0, z: amount } :
                event.key === "PageDown" ? { x: 0, y: 0, z: -amount } : null;
              if (!delta) return;
              event.preventDefault();
              if (!event.repeat) saveCheckpoint();
              onChange({ x: position.x + delta.x, y: position.y + delta.y, z: position.z + delta.z });
            }}
            className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-lg outline-none ${selectedObject === id ? "border-cyan-300 bg-cyan-900/90 ring-2 ring-cyan-300/30" : "border-white/15 bg-slate-950/85"}`}
          >{label}</button>
        </Html>
      )}
    </mesh>
    {selectedObject === id && (
      <TransformControls
        object={meshRef as unknown as RefObject<THREE.Object3D>}
        mode="translate"
        size={0.72}
        translationSnap={snap || null}
        onMouseDown={() => {
          saveCheckpoint();
          setIsDragging(true);
        }}
        onMouseUp={() => setIsDragging(false)}
        onObjectChange={() => {
          const next = meshRef.current?.position;
          if (next) onChange({ x: next.x, y: next.y, z: next.z });
        }}
      />
    )}
    </>
  );
}
