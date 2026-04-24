"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { PointToPlaneScene } from "@/components/scene/queries/PointToPlaneScene";
import { IntersectRayPlaneScene } from "@/components/scene/queries/IntersectRayPlaneScene";
import { ClosestPointSegmentScene } from "@/components/scene/queries/ClosestPointSegmentScene";
import { SegmentSegmentScene } from "@/components/scene/queries/SegmentSegmentScene";

export function SceneCanvas() {
  const { queryType } = usePlaygroundStore();

  return (
    <div className="h-[500px] w-full rounded-2xl border">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        <OrbitControls makeDefault />

        <gridHelper args={[50, 50]} />
        <axesHelper args={[5]} />

        {queryType === "project-point-to-plane" && <PointToPlaneScene />}
        {queryType === "intersect-ray-plane" && <IntersectRayPlaneScene />}
        {queryType === "closest-point-segment" && <ClosestPointSegmentScene />}
        {queryType === "segment-segment" && <SegmentSegmentScene />}
      </Canvas>
    </div>
  );
}