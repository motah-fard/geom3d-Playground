"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { Html, Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { CELL_RING_SITES, voronoiCell } from "@/lib/local-geometry";

type Bubble = { id: number; position: Vec3 };

// A freshly-added bubble's own cell fades and grows in over this long,
// rather than snapping to its exact Voronoi boundary instantly — cheap to
// do exactly (unlike its neighbors' cells, whose new boundaries there's no
// honest way to tween: their vertex count itself changes the moment a new
// site starts competing for space, so there's no matching point to lerp
// from). SETTLE_PULSE_S instead gives the *whole* packing a brief shared
// flash on every add/remove, reading as "everything just resettled" even
// though only the new cell is actually animating continuously.
const SPAWN_DURATION_S = 0.4;
const SETTLE_PULSE_S = 0.5;

// A small rotating palette so added bubbles read as distinct cells rather
// than one repeated color — a soft cyan/violet iridescence, as opposed to
// the site's own fixed amber-gold.
const BUBBLE_HUES = ["#29C7E8", "#B58CFF", "#4DD4A8", "#7C83FF"];

function cellPolygonGeometry(cell: Vec3[]) {
  if (cell.length < 3) return null;
  const shape = new THREE.Shape();
  shape.moveTo(cell[0].x, cell[0].y);
  for (const point of cell.slice(1)) shape.lineTo(point.x, point.y);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

export function CellPackingScene() {
  const { cellCenter, setCellCenterInput, setShouldAutoRun, objectLabels, selectedObject } = usePlaygroundStore();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [spawnProgress, setSpawnProgress] = useState<Record<number, number>>({});
  const [settlePulse, setSettlePulse] = useState(0);
  const nextBubbleId = useRef(0);

  // The main, store-tracked site (drives the results panel via the API
  // layer, unchanged) plus any exploratory bubbles the visitor has added —
  // every site's cell is recomputed against every other site live.
  const sites = [{ id: "cellCenter", position: cellCenter }, ...bubbles.map((b) => ({ id: `bubble-${b.id}`, position: b.position }))];
  const canDeleteSelected = bubbles.some((b) => `bubble-${b.id}` === selectedObject);

  useFrame((_state, delta) => {
    if (settlePulse > 0) setSettlePulse((p) => Math.max(0, p - delta / SETTLE_PULSE_S));
    setSpawnProgress((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const bubble of bubbles) {
        const current = next[bubble.id] ?? 0;
        if (current < 1) {
          next[bubble.id] = Math.min(1, current + delta / SPAWN_DURATION_S);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  });

  const addBubble = (point: Vec3) => {
    const id = nextBubbleId.current++;
    setBubbles((prev) => [...prev, { id, position: { x: point.x, y: point.y, z: 0 } }]);
    setSpawnProgress((prev) => ({ ...prev, [id]: 0 }));
    // Every add or remove ripples through the whole packing — every other
    // cell's boundary genuinely does shift — so flash all of them together.
    setSettlePulse(1);
  };

  const removeSelectedBubble = () => {
    const removedId = bubbles.find((b) => `bubble-${b.id}` === selectedObject)?.id;
    setBubbles((prev) => prev.filter((b) => `bubble-${b.id}` !== selectedObject));
    if (removedId !== undefined) {
      setSpawnProgress((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
    }
    setSettlePulse(1);
  };

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3 flex flex-col gap-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 backdrop-blur">
            Click empty space to add a bubble
          </div>
          {canDeleteSelected && (
            <button
              type="button"
              onClick={removeSelectedBubble}
              className="rounded-lg border border-rose-400/30 bg-slate-950/80 px-2.5 py-1.5 text-left text-[10px] font-semibold text-rose-200 backdrop-blur transition hover:bg-rose-400/10"
            >
              ✕ Remove selected bubble
            </button>
          )}
        </div>
      </Html>

      {/* click-catcher: adds a bubble wherever empty space is clicked, sitting
          just behind the cells and points so clicks on them take priority.
          onPointerDown, not onClick — matches DraggablePoint's own handler,
          which is the event type actually reaching meshes in this app. */}
      <mesh
        position={[0, 0, -0.02]}
        onPointerDown={(e) => {
          e.stopPropagation();
          addBubble(e.point);
        }}
      >
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* fixed neighboring growth centers */}
      {CELL_RING_SITES.map((site, i) => (
        <Sphere key={i} args={[0.12, 16, 16]} position={toTuple(site)}>
          <meshStandardMaterial color="#64748b" depthTest depthWrite />
        </Sphere>
      ))}

      {sites.map((site, i) => {
        const neighbors = [...CELL_RING_SITES, ...sites.filter((_, j) => j !== i).map((s) => s.position)];
        const cell = voronoiCell(site.position, neighbors);
        const geometry = cellPolygonGeometry(cell);
        const isMain = site.id === "cellCenter";
        const bubbleId = site.id.startsWith("bubble-") ? Number(site.id.slice("bubble-".length)) : null;
        // A brand-new cell fades and settles in rather than snapping into
        // place; every other cell is already exact, so it stays at full
        // strength and only picks up the shared settle-pulse below.
        const growth = isMain || bubbleId === null ? 1 : (spawnProgress[bubbleId] ?? 1);
        const color = isMain ? "#FFD166" : BUBBLE_HUES[i % BUBBLE_HUES.length];
        return (
          <group key={site.id}>
            {geometry && (
              <mesh geometry={geometry}>
                <meshBasicMaterial color={color} transparent opacity={0.16 * growth} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )}
            {cell.length >= 3 && (
              <Line
                points={[...cell.map((p) => toTuple(p)), toTuple(cell[0])]}
                color={color}
                lineWidth={2 + settlePulse * 2}
                transparent
                opacity={growth}
              />
            )}
          </group>
        );
      })}

      <DraggablePoint
        position={cellCenter}
        color="#FFD166"
        id="cellCenter"
        label={objectLabels.cellCenter}
        onChange={(p) => {
          setCellCenterInput(p);
          setShouldAutoRun(true);
        }}
      />
      {bubbles.map((bubble, index) => (
        <DraggablePoint
          key={bubble.id}
          position={bubble.position}
          color={BUBBLE_HUES[(index + 1) % BUBBLE_HUES.length]}
          id={`bubble-${bubble.id}`}
          label="+"
          onChange={(p) => {
            setBubbles((prev) => prev.map((b) => (b.id === bubble.id ? { ...b, position: { x: p.x, y: p.y, z: 0 } } : b)));
          }}
        />
      ))}
    </>
  );
}
