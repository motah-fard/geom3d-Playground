"use client";

import { useState } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { localGeodesicSphere } from "@/lib/local-geometry";

const EDGE_COLOR = "#818cf8";
// A brief flash on the structural edges whenever the subdivision level
// changes — the lattice itself can't be tweened between two different
// vertex counts, so this gives the discrete jump a felt moment instead of
// an instant, silent swap.
const SUBDIVIDE_PULSE_S = 0.5;

export function GeodesicSphereScene() {
  const { geodesicDetail, setGeodesicInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { detail } = localGeodesicSphere(Math.hypot(geodesicDetail.x, geodesicDetail.y));
  const [pulse, setPulse] = useState(0);
  const [lastDetail, setLastDetail] = useState(detail);

  if (lastDetail !== detail) {
    setLastDetail(detail);
    setPulse(1);
  }

  useFrame((_state, delta) => {
    if (pulse > 0) setPulse((p) => Math.max(0, p - delta / SUBDIVIDE_PULSE_S));
  });

  // Rendered well clear of the radius-2 sphere regardless of detail level;
  // the underlying value is still the raw drag distance from the origin.
  const handlePosition = { x: 3 + detail * 0.6, y: 0, z: 0 };

  const geometry = new THREE.IcosahedronGeometry(2, detail);

  return (
    <>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={EDGE_COLOR} transparent opacity={0.1 + 0.1 * pulse} depthWrite={false} />
        <Edges color={EDGE_COLOR} lineWidth={1.5 + pulse * 2.5} threshold={1} />
      </mesh>
      {/* the lattice's own vertices, as structural connector nodes */}
      <points geometry={geometry}>
        <pointsMaterial color="#F4F7FB" size={0.05 + pulse * 0.05} sizeAttenuation />
      </points>

      <DraggablePoint
        position={handlePosition}
        color="#FFD166"
        id="geodesicDetail"
        label={objectLabels.geodesicDetail}
        onChange={(p) => {
          setGeodesicInput(p);
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
