"use client";

import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import type { Vec3 } from "@/types/geometry";
import {
  localMilkCoronet,
  milkCoronetSpikeAngle,
  MILK_CORONET_CRATER_DEPTH,
  MILK_CORONET_MIN_POINTS,
  MILK_CORONET_SPIKE_HEIGHT,
} from "@/lib/local-geometry";

const CRATER_SAMPLES = 32;
const RING_SAMPLES = 64;
const SPLASH_DURATION_S = 0.8;
const CORONET_COLOR = "#F3B95F";

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// N is rendered off to the side (negative z) so it never collides with
// the crown; only its distance from the origin is meaningful.
function countAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), MILK_CORONET_MIN_POINTS), y: 0, z: -3.6 };
}

function craterGeometry(radius: number, depth: number): THREE.LatheGeometry {
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= CRATER_SAMPLES; i++) {
    const r = (i / CRATER_SAMPLES) * radius;
    const z = -depth * (1 - (r / radius) * (r / radius));
    profile.push(new THREE.Vector2(r, z));
  }
  return new THREE.LatheGeometry(profile, 48);
}

function ringPoints(radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / RING_SAMPLES;
    points.push([radius * Math.cos(theta), radius * Math.sin(theta), 0]);
  }
  return points;
}

export function MilkCoronetScene() {
  const { milkRadius, milkCount, setMilkCoronetInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { progress: splashProgress, setProgress: setSplashProgress, playing: splashing, play, pause, reset, speed, setSpeed } = useBuildAnimation(SPLASH_DURATION_S);

  const radiusPoint = onAxis(milkRadius);
  const countPoint = countAxis(milkCount);
  const { radius, points } = localMilkCoronet(radiusPoint, countPoint);

  // Eased so the crown rises quickly and settles, like the real splash
  // decelerating into its crown rather than growing at a constant rate.
  const ease = Math.sin((splashProgress * Math.PI) / 2);
  const craterDepth = MILK_CORONET_CRATER_DEPTH * ease;
  const spikeHeight = Math.max(MILK_CORONET_SPIKE_HEIGHT * ease, 0.001);
  const spikeRadius = Math.max(0.13 * ease, 0.001);

  const spikeTips: [number, number, number][] = [];
  for (let i = 0; i < points; i++) {
    const theta = milkCoronetSpikeAngle(i, points);
    spikeTips.push([radius * Math.cos(theta), radius * Math.sin(theta), 0]);
  }

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3">
          <BuildControls
            label="Splash"
            playing={splashing}
            progress={splashProgress}
            onPlayPause={() => (splashing ? pause() : play())}
            onReset={reset}
            onScrub={setSplashProgress}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      </Html>

      {/* fluid-like surface: low roughness for a wet sheen rather than a matte solid */}
      <mesh geometry={craterGeometry(radius, craterDepth)} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.85} side={THREE.DoubleSide} roughness={0.15} metalness={0.05} />
      </mesh>

      {spikeTips.map(([x, y], i) => (
        <mesh key={i} position={[x, y, spikeHeight / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[spikeRadius, spikeHeight, 10]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} />
        </mesh>
      ))}

      {/* the inscribed N-gon connecting the crown points */}
      <Line points={[...spikeTips, spikeTips[0]]} color={CORONET_COLOR} lineWidth={2} transparent opacity={ease} />
      {/* the smooth circle the polygon is approximating */}
      <Line points={ringPoints(radius)} color="#64748b" lineWidth={1} dashed dashSize={0.12} gapSize={0.1} />

      <DraggablePoint
        position={radiusPoint}
        color="#FFD166"
        id="milkRadius"
        label={objectLabels.milkRadius}
        onChange={(p) => {
          setMilkCoronetInputs({ radiusPoint: onAxis(p), countPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={countPoint}
        color="#29C7E8"
        id="milkCount"
        label={objectLabels.milkCount}
        onChange={(p) => {
          setMilkCoronetInputs({ radiusPoint, countPoint: countAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
