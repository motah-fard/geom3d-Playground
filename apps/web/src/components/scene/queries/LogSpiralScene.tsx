"use client";

import { Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { localLogSpiral, logSpiralPoint } from "@/lib/local-geometry";

const TURNS = 3;
const SAMPLES_PER_TURN = 72;
const SPIRAL_COLOR = "#F3B95F";
const RAY_COUNT = 8;
const TANGENT_TICK_LENGTH = 0.5;
const ARC_RADIUS = 0.35;
const ARC_SAMPLES = 24;

// The tangent direction of r = a·e^(bθ) at a given θ, as a unit vector —
// used to draw the short tick at each construction ray showing the curve
// crossing it at the same angle every time.
function spiralTangent(theta: number, b: number): { x: number; y: number } {
  const dx = b * Math.cos(theta) - Math.sin(theta);
  const dy = b * Math.sin(theta) + Math.cos(theta);
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

// The two control points only ever move along the positive X axis — only
// their distance from the origin is meaningful, so any off-axis drag is
// projected back onto the axis for both the math and the rendered position.
function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function LogSpiralScene() {
  const { spiralStart, spiralTurn, setSpiralInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const start = onAxis(spiralStart);
  const turn = onAxis(spiralTurn);
  const { a, b } = localLogSpiral({ start, turn });

  const curve: [number, number, number][] = [];
  const totalSamples = TURNS * SAMPLES_PER_TURN;
  for (let i = 0; i <= totalSamples; i++) {
    const theta = (i / SAMPLES_PER_TURN) * (2 * Math.PI);
    curve.push(toTuple(logSpiralPoint(theta, a, b)));
  }

  // Construction rays — the defining property of the equiangular spiral is
  // that it crosses every one of these radii at the same angle, visualized
  // by an identical tangent tick at each crossing.
  const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
    const theta = (i / RAY_COUNT) * 2 * Math.PI;
    const point = logSpiralPoint(theta, a, b);
    const tangent = spiralTangent(theta, b);
    return { theta, point, tangent };
  });

  // A small arc at the first ray (θ = 0, exactly the "S" point) between the
  // radius direction and the tangent direction, making the constant angle
  // the calculation panel reports as "pitch angle" visible, not just numeric.
  const [firstRay] = rays;
  const tangentAngle = Math.atan2(firstRay.tangent.y, firstRay.tangent.x);
  let sweep = tangentAngle;
  while (sweep > Math.PI) sweep -= 2 * Math.PI;
  while (sweep < -Math.PI) sweep += 2 * Math.PI;
  const anglePoints: [number, number, number][] = Array.from({ length: ARC_SAMPLES + 1 }, (_, i) => {
    const t = (sweep * i) / ARC_SAMPLES;
    return [firstRay.point.x + ARC_RADIUS * Math.cos(t), firstRay.point.y + ARC_RADIUS * Math.sin(t), 0];
  });

  return (
    <>
      {/* luminous curve: a wide, faint halo beneath a crisp core line */}
      <Line points={curve} color={SPIRAL_COLOR} lineWidth={7} transparent opacity={0.22} />
      <Line points={curve} color={SPIRAL_COLOR} lineWidth={2.5} />

      {rays.map((ray, i) => (
        <group key={i}>
          <Line points={[[0, 0, 0], toTuple(ray.point)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
          <Line
            points={[
              [ray.point.x - ray.tangent.x * (TANGENT_TICK_LENGTH / 2), ray.point.y - ray.tangent.y * (TANGENT_TICK_LENGTH / 2), 0],
              [ray.point.x + ray.tangent.x * (TANGENT_TICK_LENGTH / 2), ray.point.y + ray.tangent.y * (TANGENT_TICK_LENGTH / 2), 0],
            ]}
            color="#F4F7FB"
            lineWidth={1.5}
          />
        </group>
      ))}
      <Line points={anglePoints} color="#B58CFF" lineWidth={1.5} />

      {/* extends the θ=0 ray out to T, the radius after one full turn */}
      <Line points={[toTuple(start), toTuple(turn)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />

      <DraggablePoint
        position={start}
        color="#FFD166"
        id="spiralStart"
        label={objectLabels.spiralStart}
        onChange={(p) => {
          setSpiralInputs({ start: onAxis(p), turn });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={turn}
        color="#29C7E8"
        id="spiralTurn"
        label={objectLabels.spiralTurn}
        onChange={(p) => {
          setSpiralInputs({ start, turn: onAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
