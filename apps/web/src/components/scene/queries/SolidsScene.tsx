"use client";

import * as THREE from "three";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { localSolid } from "@/lib/local-geometry";

function onAxisAt(p: Vec3, zOffset: number): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 0.3), y: 0, z: zOffset };
}

export function SolidsScene() {
  const { solidType, solidDimA, solidDimB, solidDimC, setSolidInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const dimAPoint = onAxisAt(solidDimA, 0);
  const dimBPoint = onAxisAt(solidDimB, -2.2);
  const dimCPoint = onAxisAt(solidDimC, -4.4);
  const result = localSolid(solidType, dimAPoint.x, dimBPoint.x, dimCPoint.x);
  const { dimA: a, dimB: b, dimC: c } = result;

  const geometry = (() => {
    switch (solidType) {
      case "cube":
        return new THREE.BoxGeometry(a, a, a);
      case "box":
        return new THREE.BoxGeometry(a, c, b); // box height (Y in three.js) maps to our C
      case "cylinder":
        return new THREE.CylinderGeometry(a, a, b, 48);
      case "cone":
        return new THREE.ConeGeometry(a, b, 48);
      case "sphere":
        return new THREE.SphereGeometry(a, 32, 24);
      case "pyramid":
        return new THREE.ConeGeometry(a / Math.SQRT2, b, 4);
    }
  })();

  // Every solid but the sphere is built along three.js's local Y axis;
  // rotating -90° about X maps that to this app's Z-up convention. Each
  // shape is left centered on the origin (no need to rest it "on the
  // ground") so it reads the same way as every other chapter's mesh.
  const needsUpright = solidType !== "sphere";

  return (
    <>
      <mesh geometry={geometry} rotation={needsUpright ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry} rotation={needsUpright ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" wireframe transparent opacity={0.3} />
      </mesh>

      <DraggablePoint
        position={dimAPoint}
        color="hotpink"
        id="solidDimA"
        label={objectLabels.solidDimA}
        onChange={(p) => {
          setSolidInputs({ dimA: onAxisAt(p, 0), dimB: solidDimB, dimC: solidDimC });
          setShouldAutoRun(true);
        }}
      />
      {(solidType === "box" || solidType === "cylinder" || solidType === "cone" || solidType === "pyramid") && (
        <DraggablePoint
          position={dimBPoint}
          color="cyan"
          id="solidDimB"
          label={objectLabels.solidDimB}
          onChange={(p) => {
            setSolidInputs({ dimA: solidDimA, dimB: onAxisAt(p, -2.2), dimC: solidDimC });
            setShouldAutoRun(true);
          }}
        />
      )}
      {solidType === "box" && (
        <DraggablePoint
          position={dimCPoint}
          color="lime"
          id="solidDimC"
          label={objectLabels.solidDimC}
          onChange={(p) => {
            setSolidInputs({ dimA: solidDimA, dimB: solidDimB, dimC: onAxisAt(p, -4.4) });
            setShouldAutoRun(true);
          }}
        />
      )}
    </>
  );
}
