"use client";

import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import type { Vec3 } from "@/types/geometry";
import { HELICOID_TURNS, helicoidPoint, localHelicoid } from "@/lib/local-geometry";

const U_STEPS = 36;
const V_STEPS = 140;
const TWIST_DURATION_S = 1.2;
const CENTER_COLOR = new THREE.Color("#F3B95F");
const EDGE_COLOR = new THREE.Color("#29C7E8");

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// The pitch point is drawn just outside the ribbon's outer edge, at a
// fixed horizontal offset — only its height (z) feeds the math.
function pitchAxis(p: Vec3, radius: number): Vec3 {
  return { x: radius + 0.7, y: 0, z: p.z };
}

function buildHelicoidGeometry(radius: number, c: number): THREE.BufferGeometry {
  const totalAngle = HELICOID_TURNS * 2 * Math.PI;
  const positions: number[] = [];
  const colors: number[] = [];
  const tint = new THREE.Color();
  const stride = V_STEPS + 1;
  for (let i = 0; i <= U_STEPS; i++) {
    const u = (i / U_STEPS) * radius;
    tint.copy(CENTER_COLOR).lerp(EDGE_COLOR, i / U_STEPS);
    for (let j = 0; j <= V_STEPS; j++) {
      const v = (j / V_STEPS) * totalAngle;
      const p = helicoidPoint(u, v, c);
      positions.push(p.x, p.y, p.z);
      colors.push(tint.r, tint.g, tint.b);
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < U_STEPS; i++) {
    for (let j = 0; j < V_STEPS; j++) {
      const a = i * stride + j;
      const b = a + stride;
      const c2 = a + 1;
      const d = b + 1;
      indices.push(a, b, c2, c2, b, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function outerEdgeCurve(radius: number, c: number): [number, number, number][] {
  const totalAngle = HELICOID_TURNS * 2 * Math.PI;
  const points: [number, number, number][] = [];
  for (let j = 0; j <= V_STEPS; j++) {
    const v = (j / V_STEPS) * totalAngle;
    const p = helicoidPoint(radius, v, c);
    points.push([p.x, p.y, p.z]);
  }
  return points;
}

export function HelicoidScene() {
  const { helicoidRadius, helicoidPitch, setHelicoidInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { progress: twistProgress, setProgress: setTwistProgress, playing: twisting, play, pause, reset, speed, setSpeed } = useBuildAnimation(TWIST_DURATION_S);

  const radiusPoint = onAxis(helicoidRadius);
  const { radius, c } = localHelicoid(radiusPoint, helicoidPitch);
  const pitchPoint = pitchAxis(helicoidPitch, radius);

  // Eased so the ribbon winds up quickly and settles into its final pitch,
  // rather than twisting at a constant rate — c = 0 is exactly a flat disk,
  // giving a natural "untwisted sheet becomes a screw thread" starting point.
  const ease = Math.sin((twistProgress * Math.PI) / 2);
  const animatedC = c * ease;

  const geometry = buildHelicoidGeometry(radius, animatedC);

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3">
          <BuildControls
            label="Twist"
            playing={twisting}
            progress={twistProgress}
            onPlayPause={() => (twisting ? pause() : play())}
            onReset={reset}
            onScrub={setTwistProgress}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      </Html>

      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors transparent opacity={0.72} side={THREE.DoubleSide} depthTest depthWrite={false} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors wireframe transparent opacity={0.25} />
      </mesh>

      <Line points={outerEdgeCurve(radius, animatedC)} color="#64748b" lineWidth={1.5} />
      <Line points={[[radiusPoint.x, 0, 0], [0, 0, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[pitchPoint.x, 0, 0], pitchPoint.z >= 0 ? [pitchPoint.x, 0, pitchPoint.z] : [pitchPoint.x, 0, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />

      <DraggablePoint
        position={radiusPoint}
        color="#FFD166"
        id="helicoidRadius"
        label={objectLabels.helicoidRadius}
        onChange={(p) => {
          setHelicoidInputs({ radiusPoint: onAxis(p), pitchPoint: helicoidPitch });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={pitchPoint}
        color="#29C7E8"
        id="helicoidPitch"
        label={objectLabels.helicoidPitch}
        onChange={(p) => {
          setHelicoidInputs({ radiusPoint, pitchPoint: { x: 0, y: 0, z: p.z } });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
