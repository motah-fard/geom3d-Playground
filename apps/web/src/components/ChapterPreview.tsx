"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { QueryType } from "@/types/geometry";

// A small, stylized stand-in shape per chapter — not the real computed
// geometry (that would mean maintaining 31 miniature copies of each scene),
// just enough visual variety that a gallery grid doesn't read as identical
// spinning blobs. Some overlap between conceptually similar chapters
// (rays, segments, boxes) is expected and fine — the label under each
// thumbnail carries the rest.
function PreviewGeometry({ query }: { query: QueryType }) {
  switch (query) {
    // Geometry Foundations
    case "angles":
      return <torusGeometry args={[0.8, 0.12, 16, 48, Math.PI * 0.6]} />;
    case "pythagorean-theorem":
      return <boxGeometry args={[1.4, 1.4, 0.15]} />;
    case "right-triangle-trig":
      return <coneGeometry args={[0.8, 1.4, 3]} />;
    case "circle-measures":
      return <torusGeometry args={[0.8, 0.28, 16, 48]} />;
    case "regular-polygon":
      return <cylinderGeometry args={[0.9, 0.9, 0.3, 6]} />;
    case "transformations":
      return <tetrahedronGeometry args={[1, 0]} />;
    // 3D Geometry
    case "solids-3d":
      return <boxGeometry args={[1.3, 1.3, 1.3]} />;
    case "cross-sections":
      return <coneGeometry args={[0.9, 1.5, 32]} />;
    case "nets":
      return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    // Computational Geometry
    case "project-point-to-plane":
    case "intersect-ray-plane":
      return <boxGeometry args={[1.6, 1.6, 0.1]} />;
    case "closest-point-segment":
    case "segment-segment":
      return <cylinderGeometry args={[0.05, 0.05, 1.8, 12]} />;
    case "intersect-ray-aabb":
    case "closest-point-aabb":
      return <boxGeometry args={[1.1, 1.1, 1.1]} />;
    // Growth & Form
    case "cartesian-transform":
      return <boxGeometry args={[1.3, 1.3, 1.3]} />;
    case "log-spiral-growth":
      return <torusKnotGeometry args={[0.7, 0.22, 96, 12, 2, 3]} />;
    case "cell-packing":
      return <cylinderGeometry args={[0.9, 0.9, 0.5, 6]} />;
    case "helical-shell-growth":
      return <torusKnotGeometry args={[0.6, 0.18, 96, 12, 1, 5]} />;
    case "square-cube-law":
      return <sphereGeometry args={[0.9, 24, 24]} />;
    case "catenary-arch":
      return <torusGeometry args={[0.9, 0.16, 16, 48, Math.PI]} />;
    case "allometric-growth":
      return <sphereGeometry args={[0.85, 24, 24]} />;
    case "phyllotaxis":
      return <dodecahedronGeometry args={[0.9, 0]} />;
    case "logistic-growth":
      return <coneGeometry args={[0.8, 1.4, 24]} />;
    case "geodesic-sphere":
      return <icosahedronGeometry args={[0.9, 1]} />;
    case "whirling-squares":
      return <octahedronGeometry args={[0.95, 0]} />;
    case "catenoid":
      return <torusGeometry args={[0.75, 0.35, 16, 48]} />;
    case "milk-coronet":
      return <coneGeometry args={[0.85, 0.9, 12]} />;
    case "egg-curve":
      return <sphereGeometry args={[0.85, 24, 24]} />;
    case "helicoid":
      return <torusKnotGeometry args={[0.65, 0.15, 96, 12, 2, 5]} />;
    case "bee-cell":
      return <cylinderGeometry args={[0.85, 0.85, 1.1, 6]} />;
    default:
      return <icosahedronGeometry args={[0.9, 0]} />;
  }
}

function SpinningPreview({ query, color, spinning }: { query: QueryType; color: string; spinning: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    if (!spinning || !ref.current) return;
    ref.current.rotation.y += delta * 0.7;
    ref.current.rotation.x += delta * 0.2;
  });
  // A gentle static tilt so even the non-hovered thumbnail reads as 3D.
  return (
    <group ref={ref} rotation={query === "egg-curve" ? [0, 0, Math.PI / 2] : [0.4, 0.6, 0]} scale={query === "egg-curve" ? [1, 1.3, 1] : [1, 1, 1]}>
      <mesh>
        <PreviewGeometry query={query} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  );
}

export function ChapterPreview({ query, color, hovered }: { query: QueryType; color: string; hovered: boolean }) {
  return (
    <Canvas
      frameloop={hovered ? "always" : "demand"}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true }}
      camera={{ position: [0, 0, 3.2], fov: 40 }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={1.1} />
      <SpinningPreview query={query} color={color} spinning={hovered} />
    </Canvas>
  );
}
