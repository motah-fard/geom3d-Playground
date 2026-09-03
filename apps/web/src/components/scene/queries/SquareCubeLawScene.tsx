"use client";

import { Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { localSquareCubeLaw } from "@/lib/local-geometry";

export function SquareCubeLawScene() {
  const { magnitudePoint, setMagnitudeInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { radius } = localSquareCubeLaw(magnitudePoint);

  return (
    <>
      <Sphere args={[radius, 48, 48]}>
        <meshStandardMaterial color="#4ade80" transparent opacity={0.28} wireframe={false} depthTest depthWrite={false} />
      </Sphere>
      <Sphere args={[radius, 24, 24]}>
        <meshStandardMaterial color="#4ade80" wireframe transparent opacity={0.5} />
      </Sphere>

      <DraggablePoint
        position={{ x: radius, y: 0, z: 0 }}
        color="hotpink"
        id="magnitudePoint"
        label={objectLabels.magnitudePoint}
        onChange={(p) => {
          setMagnitudeInput(p);
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
