"use client";

import { useState } from "react";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import type { Vec3 } from "@/types/geometry";
import { EGG_CENTER_DISTANCE, eggProfilePoints, localEggCurve } from "@/lib/local-geometry";

const SHELL_COLOR = "#F5E6D3";

type RenderMode = "surface" | "mathematical" | "mesh";

function radialAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function EggCurveScene() {
  const { eggBig, eggSmall, setEggCurveInputs, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const [renderMode, setRenderMode] = useState<RenderMode>("surface");

  const bigPoint = radialAxis(eggBig);
  const smallPoint = radialAxis(eggSmall);
  const result = localEggCurve(bigPoint, smallPoint);

  const profile = eggProfilePoints(result.bigRadius, result.smallRadius, 40).map(
    ([r, z]) => new THREE.Vector2(r, z)
  );
  const geometry = new THREE.LatheGeometry(profile, 48);

  const bigMarker: Vec3 = { x: result.bigRadius, y: 0, z: EGG_CENTER_DISTANCE };
  const smallMarker: Vec3 = { x: result.smallRadius, y: 0, z: 0 };

  const showWireframe = renderMode === "mesh";
  const showConstruction = renderMode === "mathematical";
  const surfaceOpacity = renderMode === "mathematical" ? 0.5 : 0.92;
  // The generating profile curve, laid out in its own construction plane
  // (x = radius, y = height) exactly as it's revolved to make the shell.
  const profilePoints: [number, number, number][] = profile.map((p) => [p.x, p.y, 0]);

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3 flex overflow-hidden rounded-lg border border-slate-800 bg-slate-950/80 text-[10px] font-semibold backdrop-blur">
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
      </Html>

      {/* smooth, matte shell — a soft ceramic-like sheen rather than a flat plastic look */}
      <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={SHELL_COLOR} transparent opacity={surfaceOpacity} side={THREE.DoubleSide} roughness={0.55} metalness={0.05} />
      </mesh>
      {showWireframe && (
        <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={SHELL_COLOR} wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {showConstruction && (
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {/* the generating profile, held in place at phi = 0 */}
          <Line points={profilePoints} color="#F4F7FB" lineWidth={2} />
          {/* the symmetry axis it revolves around */}
          <Line points={[[0, -0.6, 0], [0, EGG_CENTER_DISTANCE + result.bigRadius + 0.6, 0]]} color="#64748B" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />
        </group>
      )}

      <DraggablePoint
        position={bigMarker}
        color="#FFD166"
        id="eggBig"
        label={objectLabels.eggBig}
        onChange={(p) => {
          setEggCurveInputs({ bigPoint: radialAxis(p), smallPoint });
          setShouldAutoRun(true);
        }}
      />
      <DraggablePoint
        position={smallMarker}
        color="#29C7E8"
        id="eggSmall"
        label={objectLabels.eggSmall}
        onChange={(p) => {
          setEggCurveInputs({ bigPoint, smallPoint: radialAxis(p) });
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
