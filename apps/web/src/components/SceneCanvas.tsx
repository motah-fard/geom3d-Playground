"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { useState } from "react";

function DraggablePoint({
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
      position={[position.x, position.y, position.z]}
      onPointerDown={(e) => {
        setDragging(true);
      }}
      onPointerUp={(e) => {
        // e.stopPropagation();
        setDragging(false);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;

        e.stopPropagation();

        // ✅ FIX: lock to XY plane to prevent jumping
        const newX = e.point.x;
        const newY = e.point.y;
        const newZ = e.point.z;

        // if (!isFinite(newX) || !isFinite(newY)) return;

        onChange({ x: newX, y: newY, z: newZ });
      }}
      onPointerOver={() => (document.body.style.cursor = "grab")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function SceneCanvas() {
  const {
    queryType,
    point,
    segmentA,
    segmentB,
    segmentResult,
    setSegmentInputs,
    setShouldAutoRun,
  } = usePlaygroundStore();

  return (
    <div className="h-[500px] w-full rounded-2xl border">
      <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        <gridHelper args={[50, 50]} />

        <OrbitControls />

        {/* ========================= */}
        {/* CLOSEST POINT TO SEGMENT */}
        {/* ========================= */}
        {queryType === "closest-point-segment" && (
          <>
            {/* 🔴 draggable point */}
            <DraggablePoint
              position={point}
              color="hotpink"
              onChange={(p) => {
                setSegmentInputs({
                  point: p,
                  segmentA,
                  segmentB,
                });
                setShouldAutoRun(true);
              }}
            />

            {/* 🔵 segment endpoints */}
            <DraggablePoint
              position={segmentA}
              color="blue"
              onChange={(p) => {
                setSegmentInputs({
                  point,
                  segmentA: p,
                  segmentB,
                });
                setShouldAutoRun(true);
              }}
            />

            <DraggablePoint
              position={segmentB}
              color="blue"
              onChange={(p) => {
                setSegmentInputs({
                  point,
                  segmentA,
                  segmentB: p,
                });
                setShouldAutoRun(true);
              }}
            />

            {/* 🔵 segment line */}
            <Line
              points={[
                [segmentA.x, segmentA.y, segmentA.z],
                [segmentB.x, segmentB.y, segmentB.z],
              ]}
              color="blue"
              lineWidth={2}
            />

            {/* 🟢 closest point + orange distance */}
            {segmentResult && (
              <>
                <Sphere
                  args={[0.2, 32, 32]}
                  position={[
                    segmentResult.point.x,
                    segmentResult.point.y,
                    segmentResult.point.z,
                  ]}
                >
                  <meshStandardMaterial color="green" />
                </Sphere>

                <Line
                  points={[
                    [point.x, point.y, point.z],
                    [
                      segmentResult.point.x,
                      segmentResult.point.y,
                      segmentResult.point.z,
                    ],
                  ]}
                  color="orange"
                  lineWidth={2}
                />
              </>
            )}
          </>
        )}
      </Canvas>
    </div>
  );
}
