"use client";

import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple, type Vec3 } from "@/types/geometry";
import { CATENARY_HALF_SPAN, catenaryAFromSag, catenaryPoint, localCatenary } from "@/lib/local-geometry";

const SAMPLES = 80;

function onAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: 0 };
}

export function CatenaryScene() {
  const { catenaryA, setCatenaryInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const aPoint = onAxis(catenaryA);
  const { a, sag } = localCatenary(aPoint, CATENARY_HALF_SPAN);

  const curve: [number, number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const x = -CATENARY_HALF_SPAN + (2 * CATENARY_HALF_SPAN * i) / SAMPLES;
    curve.push(toTuple(catenaryPoint(x, a)));
  }

  // Dragging either endpoint vertically sets a new target sag (the height
  // above the curve's vertex, which always sits at y=0); the tautness
  // parameter a is solved backward from that sag so the whole curve
  // recomputes to match where the student actually dragged to.
  const onEndpointDrag = (p: Vec3) => {
    const targetSag = Math.max(p.y, 0.05);
    const newA = catenaryAFromSag(targetSag, CATENARY_HALF_SPAN);
    setCatenaryInput({ x: newA, y: 0, z: 0 });
    setShouldAutoRun(true);
  };

  return (
    <>
      <Line points={curve} color="#29C7E8" lineWidth={2.5} />

      <Html position={[0, sag * 0.5 + 0.3, 0]} center style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-center font-mono text-xs text-slate-200 shadow-xl backdrop-blur">
          y = <span className="font-bold text-cyan-300">{a.toFixed(2)}</span>&middot;cosh(x / <span className="font-bold text-cyan-300">{a.toFixed(2)}</span>)
        </div>
      </Html>

      {/* draggable anchors at each end of the span — either one drags the
          same underlying tautness parameter, since a real hanging chain's
          two ends move in lockstep. "catenaryA" keeps the id conventionally
          tied to formula-segments.ts's hover-glow and the object-labels
          settings panel; the mirror anchor is an unlabeled convenience
          handle rather than a second tracked variable. */}
      <DraggablePoint
        key="catenaryAMirror"
        position={{ x: -CATENARY_HALF_SPAN, y: sag, z: 0 }}
        color="#FFD166"
        id="catenaryAMirror"
        onChange={onEndpointDrag}
      />
      <DraggablePoint
        key="catenaryA"
        position={{ x: CATENARY_HALF_SPAN, y: sag, z: 0 }}
        color="#FFD166"
        id="catenaryA"
        label={objectLabels.catenaryA}
        onChange={onEndpointDrag}
      />
    </>
  );
}
