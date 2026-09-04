"use client";

import { useState } from "react";
import * as THREE from "three";
import { Html, Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import type { Vec3 } from "@/types/geometry";
import { CATENOID_HALF_HEIGHT, catenoidHelicoidMorphPoint, catenoidRadius, localCatenoid, MORPH_HALF_HEIGHT, MORPH_TURNS } from "@/lib/local-geometry";

const PROFILE_SAMPLES = 40;
const RING_SAMPLES = 48;
const BUILD_DURATION_S = 1.8;
const MORPH_DURATION_S = 2.5;
const MORPH_U_STEPS = 64;
const MORPH_V_STEPS = 24;
const WAIST_COLOR = new THREE.Color("#5B6EF5");
const RIM_COLOR = new THREE.Color("#29C7E8");

type RenderMode = "surface" | "mathematical" | "mesh" | "morph";

// The associate-family surface between the catenoid (theta = pi/2) and the
// helicoid (theta = 0), built on its own fixed-scale (u, v) grid — this is
// a standalone demonstration of the Bonnet pair, not the draggable-"a"
// catenoid above, so it gets its own geometry builder and color gradient.
function buildMorphGeometry(theta: number): THREE.BufferGeometry {
  const totalAngle = MORPH_TURNS * 2 * Math.PI;
  const positions: number[] = [];
  const colors: number[] = [];
  const tint = new THREE.Color();
  const stride = MORPH_V_STEPS + 1;
  for (let i = 0; i <= MORPH_U_STEPS; i++) {
    const u = (i / MORPH_U_STEPS) * totalAngle;
    for (let j = 0; j <= MORPH_V_STEPS; j++) {
      const v = -MORPH_HALF_HEIGHT + (2 * MORPH_HALF_HEIGHT * j) / MORPH_V_STEPS;
      const p = catenoidHelicoidMorphPoint(u, v, theta);
      positions.push(p.x, p.y, p.z);
      tint.copy(WAIST_COLOR).lerp(RIM_COLOR, Math.abs(v) / MORPH_HALF_HEIGHT);
      colors.push(tint.r, tint.g, tint.b);
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < MORPH_U_STEPS; i++) {
    for (let j = 0; j < MORPH_V_STEPS; j++) {
      const a = i * stride + j;
      const b = a + stride;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

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
  const { progress: buildProgress, setProgress: setBuildProgress, playing: building, play, pause, reset, speed, setSpeed } = useBuildAnimation(BUILD_DURATION_S);
  const { progress: morphProgress, setProgress: setMorphProgress, playing: morphing, play: morphPlay, pause: morphPause, reset: morphReset, speed: morphSpeed, setSpeed: setMorphSpeed } = useBuildAnimation(MORPH_DURATION_S);

  const isMorph = renderMode === "morph";
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

  // progress 0 = pure catenoid (theta = pi/2), progress 1 = pure helicoid
  // (theta = 0) — Reset returns to the catenoid this chapter is about;
  // Play morphs forward toward the helicoid, matching the button's label.
  const morphTheta = (1 - morphProgress) * (Math.PI / 2);
  const morphGeometry = isMorph ? buildMorphGeometry(morphTheta) : null;

  const profilePoints: [number, number, number][] = profile.map((p) => [p.x, p.y, 0]);
  const showWireframe = renderMode === "mesh";
  const showConstruction = renderMode === "mathematical";
  const surfaceOpacity = renderMode === "mathematical" ? 0.55 : 0.82;

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3 flex flex-col gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 text-[10px] font-semibold backdrop-blur">
            {(["surface", "mathematical", "mesh", "morph"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={renderMode === mode}
                onClick={() => setRenderMode(mode)}
                className={`px-2.5 py-1.5 capitalize transition ${renderMode === mode ? "bg-primary/25 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                {mode === "morph" ? "Morph → Helicoid" : mode}
              </button>
            ))}
          </div>
          {isMorph ? (
            <BuildControls
              label="Morph → Helicoid"
              playing={morphing}
              progress={morphProgress}
              onPlayPause={() => (morphing ? morphPause() : morphPlay())}
              onReset={morphReset}
              onScrub={setMorphProgress}
              speed={morphSpeed}
              onSpeedChange={setMorphSpeed}
            />
          ) : (
            <BuildControls
              label="Build by revolution"
              playing={building}
              progress={buildProgress}
              onPlayPause={() => (building ? pause() : play())}
              onReset={reset}
              onScrub={setBuildProgress}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          )}
        </div>
      </Html>

      {isMorph && morphGeometry ? (
        <>
          {/* Reuses the catenoid's own indigo-to-cyan gradient — this is
              the same waist-to-rim visual identity, still bending, never
              stretching, into the helicoid's screw shape. */}
          <mesh geometry={morphGeometry}>
            <meshStandardMaterial vertexColors transparent opacity={0.82} side={THREE.DoubleSide} depthTest depthWrite={false} roughness={0.25} metalness={0.1} />
          </mesh>
          <mesh geometry={morphGeometry}>
            <meshBasicMaterial vertexColors wireframe transparent opacity={0.15} />
          </mesh>
        </>
      ) : (
        <>
          <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
            <meshStandardMaterial vertexColors transparent opacity={surfaceOpacity} side={THREE.DoubleSide} depthTest depthWrite={false} roughness={0.25} metalness={0.1} />
          </mesh>
          {showWireframe && (
            <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
              <meshBasicMaterial vertexColors wireframe transparent opacity={0.45} />
            </mesh>
          )}

          {showConstruction && (
            <group rotation={[-Math.PI / 2, 0, 0]}>
              {/* the generating catenary, held in place at phi = 0 */}
              <Line points={profilePoints} color="#F4F7FB" lineWidth={2} />
              {/* the symmetry axis it revolves around */}
              <Line points={[[0, -CATENOID_HALF_HEIGHT - 0.6, 0], [0, CATENOID_HALF_HEIGHT + 0.6, 0]]} color="#64748B" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />
            </group>
          )}
        </>
      )}

      {!isMorph && (
        <>
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
      )}
    </>
  );
}
