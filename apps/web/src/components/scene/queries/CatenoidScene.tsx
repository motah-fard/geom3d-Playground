"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { Html, Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { CATENOID_HALF_HEIGHT, catenoidRadius, localCatenoid } from "@/lib/local-geometry";

const PROFILE_SAMPLES = 40;
const RING_SAMPLES = 48;
const BUILD_DURATION_S = 1.8;
const WAIST_COLOR = new THREE.Color("#5B6EF5");
const RIM_COLOR = new THREE.Color("#29C7E8");

type RenderMode = "surface" | "mathematical" | "mesh";

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

function ringPoints(z: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= RING_SAMPLES; i++) {
    const theta = (2 * Math.PI * i) / RING_SAMPLES;
    points.push([radius * Math.cos(theta), radius * Math.sin(theta), z]);
  }
  return points;
}

// Colors the surface by height above/below the waist — indigo at the
// waist fading to cyan at the rims — so the catenoid reads as one
// continuous gradient instead of a flat single hue.
function applyHeightGradient(geometry: THREE.BufferGeometry, halfHeight: number) {
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const t = Math.min(1, Math.abs(position.getY(i)) / halfHeight);
    c.copy(WAIST_COLOR).lerp(RIM_COLOR, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

export function CatenoidScene() {
  const { catenoidA, setCatenoidInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const [renderMode, setRenderMode] = useState<RenderMode>("surface");
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(1);
  const buildStart = useRef(0);

  const aPoint = onAxis(catenoidA);
  const { a, rimRadius } = localCatenoid(aPoint);

  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= PROFILE_SAMPLES; i++) {
    const z = -CATENOID_HALF_HEIGHT + (2 * CATENOID_HALF_HEIGHT * i) / PROFILE_SAMPLES;
    profile.push(new THREE.Vector2(catenoidRadius(z, a), z));
  }

  const sweep = Math.max(buildProgress, 0.0001) * Math.PI * 2;
  const geometry = new THREE.LatheGeometry(profile, 48, 0, sweep);
  applyHeightGradient(geometry, CATENOID_HALF_HEIGHT);

  useFrame((state) => {
    if (!building) return;
    if (buildStart.current === 0) buildStart.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - buildStart.current;
    const t = Math.min(1, elapsed / BUILD_DURATION_S);
    setBuildProgress(t);
    if (t >= 1) {
      setBuilding(false);
      buildStart.current = 0;
    }
  });

  const startBuild = () => {
    buildStart.current = 0;
    setBuildProgress(0);
    setBuilding(true);
  };

  const profilePoints: [number, number, number][] = profile.map((p) => [p.x, p.y, 0]);
  const showWireframe = renderMode === "mesh";
  const showConstruction = renderMode === "mathematical";
  const surfaceOpacity = renderMode === "mathematical" ? 0.55 : 0.82;

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3 flex flex-col gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 text-[10px] font-semibold backdrop-blur">
            {(["surface", "mathematical", "mesh"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={renderMode === mode}
                onClick={() => setRenderMode(mode)}
                className={`px-2.5 py-1.5 capitalize transition ${renderMode === mode ? "bg-primary/25 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={startBuild}
            disabled={building}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-left text-[10px] font-semibold text-slate-300 backdrop-blur transition hover:text-white disabled:opacity-50"
          >
            {building ? "Revolving…" : "▶ Build by revolution"}
          </button>
        </div>
      </Html>

      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial vertexColors transparent opacity={surfaceOpacity} side={THREE.DoubleSide} depthTest depthWrite={false} roughness={0.25} metalness={0.1} />
      </mesh>
      {showWireframe && (
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial vertexColors wireframe transparent opacity={0.45} />
        </mesh>
      )}

      {showConstruction && (
        <>
          {/* the generating catenary, held in place at phi = 0 */}
          <Line points={profilePoints} color="#F4F7FB" lineWidth={2} />
          {/* the symmetry axis it revolves around */}
          <Line points={[[0, -CATENOID_HALF_HEIGHT - 0.6, 0], [0, CATENOID_HALF_HEIGHT + 0.6, 0]]} color="#64748B" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />
        </>
      )}

      {/* the two rings the film spans */}
      <Line points={ringPoints(CATENOID_HALF_HEIGHT, rimRadius)} color="#64748b" lineWidth={1.5} />
      <Line points={ringPoints(-CATENOID_HALF_HEIGHT, rimRadius)} color="#64748b" lineWidth={1.5} />

      {/* waist marker */}
      <Sphere args={[0.07, 16, 16]} position={[a, 0, 0]}>
        <meshStandardMaterial color="#64748b" depthTest depthWrite />
      </Sphere>

      <DraggablePoint
        position={aPoint}
        color="#FFD166"
        id="catenoidA"
        label={objectLabels.catenoidA}
        onChange={(p) => {
          setCatenoidInput(onAxis(p));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
