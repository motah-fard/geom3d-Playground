"use client";

import { Html, Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import { toTuple, type Vec3 } from "@/types/geometry";
import { LOGISTIC_TIME_CENTER, LOGISTIC_TIME_SPAN, localLogisticGrowth, logisticPoint } from "@/lib/local-geometry";

const SAMPLES = 100;
const TIME_DURATION_S = 2.2;
const CURVE_COLOR = "#F3B95F";
// Where the "population" bubble sits, well clear of the graph itself.
const POPULATION_POSITION: Vec3 = { x: -2.4, y: 0.4, z: 1.6 };
const POPULATION_MIN_RADIUS = 0.12;
const POPULATION_MAX_RADIUS = 0.55;

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
  const { progress: timeProgress, setProgress: setTimeProgress, playing: animating, play, pause, reset, speed, setSpeed } = useBuildAnimation(TIME_DURATION_S);

  const rPoint = rAxis(logisticR);
  const kPoint = kAxis(logisticK);
  const { r, k } = localLogisticGrowth(rPoint, kPoint);

  const currentT = timeProgress * LOGISTIC_TIME_SPAN;
  const currentVec = logisticPoint(currentT, r, k);
  const currentPoint = toTuple(currentVec);
  const currentPopulation = currentVec.y;

  const curve: [number, number, number][] = [];
  const tracedCurve: [number, number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (LOGISTIC_TIME_SPAN * i) / SAMPLES;
    const point = toTuple(logisticPoint(t, r, k));
    curve.push(point);
    if (t <= currentT) tracedCurve.push(point);
  }
  tracedCurve.push(currentPoint);

  const inflection = toTuple(logisticPoint(LOGISTIC_TIME_CENTER, r, k));
  const populationRadius = POPULATION_MIN_RADIUS + (POPULATION_MAX_RADIUS - POPULATION_MIN_RADIUS) * (currentPopulation / k);

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3">
          <BuildControls
            label="Time"
            playing={animating}
            progress={timeProgress}
            onPlayPause={() => (animating ? pause() : play())}
            onReset={reset}
            onScrub={setTimeProgress}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      </Html>

      {/* faint full trajectory, with the traced-so-far portion drawn bright on top */}
      <Line points={curve} color={CURVE_COLOR} lineWidth={1.5} transparent opacity={0.2} />
      <Line points={tracedCurve} color={CURVE_COLOR} lineWidth={2.5} />

      {/* the current moment, tracked live on the curve */}
      <Sphere args={[0.08, 16, 16]} position={currentPoint}>
        <meshStandardMaterial color={CURVE_COLOR} emissive={CURVE_COLOR} emissiveIntensity={0.6} depthTest depthWrite />
      </Sphere>

      {/* ceiling asymptote */}
      <Line points={[[0, k, 0], [LOGISTIC_TIME_SPAN, k, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />

      {/* inflection point marker */}
      <Sphere args={[0.09, 16, 16]} position={inflection}>
        <meshStandardMaterial color="#64748b" depthTest depthWrite />
      </Sphere>

      {/* the population itself, growing in step with the traced curve */}
      <Sphere args={[populationRadius, 32, 32]} position={toTuple(POPULATION_POSITION)}>
        <meshStandardMaterial color={CURVE_COLOR} transparent opacity={0.75} roughness={0.4} metalness={0.05} />
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
