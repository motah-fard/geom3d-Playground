"use client";

import * as THREE from "three";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { EGG_CENTER_DISTANCE, eggProfilePoints, localEggCurve } from "@/lib/local-geometry";

function radialAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function EggCurveScene() {
  const { eggBig, eggSmall, setEggCurveInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const bigPoint = radialAxis(eggBig);
  const smallPoint = radialAxis(eggSmall);
  const result = localEggCurve(bigPoint, smallPoint);

  const profile = eggProfilePoints(result.bigRadius, result.smallRadius, 40).map(
    ([r, z]) => new THREE.Vector2(r, z)
  );
  const geometry = new THREE.LatheGeometry(profile, 48);

  const bigMarker: Vec3 = { x: result.bigRadius, y: 0, z: EGG_CENTER_DISTANCE };
  const smallMarker: Vec3 = { x: result.smallRadius, y: 0, z: 0 };

  return (
    <>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#fdba74" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#fdba74" wireframe transparent opacity={0.25} />
      </mesh>

      <DraggablePoint
        position={bigMarker}
        color="hotpink"
        id="eggBig"
        label={objectLabels.eggBig}
        onChange={(p) => {
          setEggCurveInputs({ bigPoint: radialAxis(p), smallPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={smallMarker}
        color="cyan"
        id="eggSmall"
        label={objectLabels.eggSmall}
        onChange={(p) => {
          setEggCurveInputs({ bigPoint, smallPoint: radialAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
