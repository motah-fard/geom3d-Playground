"use client";

import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { LOGISTIC_TIME_CENTER, LOGISTIC_TIME_SPAN, localLogisticGrowth, logisticPoint } from "@/lib/local-geometry";

const SAMPLES = 100;

// R is rendered off to the side (negative z), decoupled from the curve
// itself, so it never visually collides with the curve or the K point.
function rAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: -2 };
}

// K only ever moves vertically at the fixed right edge of the time
// window; only its height is meaningful.
function kAxis(p: Vec3): Vec3 {
  return { x: LOGISTIC_TIME_SPAN, y: Math.max(p.y, 1e-6), z: 0 };
}

export function LogisticGrowthScene() {
  const { logisticR, logisticK, setLogisticInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const rPoint = rAxis(logisticR);
  const kPoint = kAxis(logisticK);
  const { r, k } = localLogisticGrowth(rPoint, kPoint);

  const curve: [number, number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (LOGISTIC_TIME_SPAN * i) / SAMPLES;
    curve.push(toTuple(logisticPoint(t, r, k)));
  }

  const inflection = toTuple(logisticPoint(LOGISTIC_TIME_CENTER, r, k));

  return (
    <>
      <Line points={curve} color="orange" lineWidth={2.5} />

      {/* ceiling asymptote */}
      <Line points={[[0, k, 0], [LOGISTIC_TIME_SPAN, k, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />

      {/* inflection point marker */}
      <Sphere args={[0.09, 16, 16]} position={inflection}>
        <meshStandardMaterial color="#64748b" depthTest depthWrite />
      </Sphere>

      <DraggablePoint
        position={rPoint}
        color="#FFD166"
        id="logisticR"
        label={objectLabels.logisticR}
        onChange={(p) => {
          setLogisticInputs({ rPoint: rAxis(p), kPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={kPoint}
        color="#29C7E8"
        id="logisticK"
        label={objectLabels.logisticK}
        onChange={(p) => {
          setLogisticInputs({ rPoint, kPoint: kAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
