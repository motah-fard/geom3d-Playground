"use client";

import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import { toTuple, type Vec3 } from "@/types/geometry";
import { helicalShellPoint, localHelicalShell } from "@/lib/local-geometry";

const TURNS = 5;
const SAMPLES_PER_TURN = 48;
const TOTAL_SAMPLES = TURNS * SAMPLES_PER_TURN;
const GROW_DURATION_S = 2.5;
const TUBE_RADIUS = 0.12;
const START_COLOR = new THREE.Color("#F3B95F");
const END_COLOR = new THREE.Color("#FF6B7A");

// S only ever moves along the positive X axis at the base (z = 0) — only
// its distance from the axis is meaningful.
function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

// T's distance from the axis sets the radius after one turn, exactly like
// S, but its height (z) is now meaningful too — the rise after one turn —
// so it is preserved rather than collapsed to zero.
function onAxisWithHeight(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: p.z };
}

function buildTube(points: THREE.Vector3[]) {
  if (points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, Math.max(points.length, 8), TUBE_RADIUS, 10, false);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const t = Math.min(1, i / position.count);
    c.copy(START_COLOR).lerp(END_COLOR, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function HelicalShellScene() {
  const { helixStart, helixTurn, setHelixInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { progress: growthProgress, setProgress: setGrowthProgress, playing: growing, play, pause, reset, speed, setSpeed } = useBuildAnimation(GROW_DURATION_S);

  const start = onAxis(helixStart);
  const turn = onAxisWithHeight(helixTurn);
  const { a, b, c } = localHelicalShell({ start, turn });

  const fullPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= TOTAL_SAMPLES; i++) {
    const theta = (i / SAMPLES_PER_TURN) * (2 * Math.PI);
    const p = helicalShellPoint(theta, a, b, c);
    fullPoints.push(new THREE.Vector3(p.x, p.y, p.z));
  }
  const curve: [number, number, number][] = fullPoints.map((p) => [p.x, p.y, p.z]);

  const grownCount = Math.max(2, Math.round(growthProgress * fullPoints.length));
  const shellGeometry = buildTube(fullPoints.slice(0, grownCount));

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3">
          <BuildControls
            label="Grow"
            playing={growing}
            progress={growthProgress}
            onPlayPause={() => (growing ? pause() : play())}
            onReset={reset}
            onScrub={setGrowthProgress}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      </Html>

      {/* faint ghost of the fully-grown shell, visible as a target shape while growing */}
      {growing && <Line points={curve} color="#F3B95F" lineWidth={1} transparent opacity={0.15} />}

      {shellGeometry && (
        <mesh geometry={shellGeometry}>
          <meshStandardMaterial vertexColors roughness={0.35} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* radius guide for S, and radius + rise guides for T */}
      <Line points={[[0, 0, 0], toTuple(start)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[0, 0, 0], [turn.x, turn.y, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />
      <Line points={[[turn.x, turn.y, 0], toTuple(turn)]} color="#475569" lineWidth={1} dashed dashSize={0.1} gapSize={0.08} />

      <DraggablePoint
        position={start}
        color="#FFD166"
        id="helixStart"
        label={objectLabels.helixStart}
        onChange={(p) => {
          setHelixInputs({ start: onAxis(p), turn });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={turn}
        color="#29C7E8"
        id="helixTurn"
        label={objectLabels.helixTurn}
        onChange={(p) => {
          setHelixInputs({ start, turn: onAxisWithHeight(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
