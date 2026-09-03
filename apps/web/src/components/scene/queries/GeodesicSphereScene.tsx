"use client";

import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { localGeodesicSphere } from "@/lib/local-geometry";

export function GeodesicSphereScene() {
  const { geodesicDetail, setGeodesicInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { detail } = localGeodesicSphere(Math.hypot(geodesicDetail.x, geodesicDetail.y));

  // Rendered well clear of the radius-2 sphere regardless of detail level;
  // the underlying value is still the raw drag distance from the origin.
  const handlePosition = { x: 3 + detail * 0.6, y: 0, z: 0 };

  return (
    <>
      <mesh>
        <icosahedronGeometry args={[2, detail]} />
        <meshStandardMaterial color="#818cf8" wireframe transparent opacity={0.85} />
      </mesh>

      <DraggablePoint
        position={handlePosition}
        color="hotpink"
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
