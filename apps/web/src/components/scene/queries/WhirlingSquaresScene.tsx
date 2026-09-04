"use client";

import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { BuildControls } from "../primitives/BuildControls";
import { useBuildAnimation } from "@/hooks/useBuildAnimation";
import { buildWhirlingSquares, localWhirlingSquares, type WhirlingSquare } from "@/lib/local-geometry";
import type { Vec3 } from "@/types/geometry";

const ARC_SAMPLES = 16;
const STEP_DURATION_S = 1.4;
const ARC_COLOR = "#F3B95F";

// N is rendered off to the side (negative z) so it never collides with
// the squares; only its distance from the origin is meaningful.
function countAxis(p: Vec3): Vec3 {
  return { x: Math.max(Math.hypot(p.x, p.y), 1e-6), y: 0, z: -3 };
}

// The corner shared between this square's inner edge and where the NEXT
// square in the rotation will be cut — the pivot the inscribed quarter
// circle turns around, keeping the arcs continuous turn to turn.
function pivotFor(square: WhirlingSquare): [number, number] {
  switch (square.direction) {
    case "left": return [square.x1, square.y0];
    case "bottom": return [square.x1, square.y1];
    case "right": return [square.x0, square.y1];
    case "top": return [square.x0, square.y0];
  }
}

function arcPoints(square: WhirlingSquare): [number, number, number][] {
  const [cx, cy] = pivotFor(square);
  const side = Math.min(square.x1 - square.x0, square.y1 - square.y0);
  const corners: [number, number][] = [
    [square.x0, square.y0], [square.x1, square.y0], [square.x1, square.y1], [square.x0, square.y1],
  ];
  const onArc = corners.filter(([x, y]) => Math.abs(Math.hypot(x - cx, y - cy) - side) < 1e-9);
  if (onArc.length < 2) return [];
  const angle0 = Math.atan2(onArc[0][1] - cy, onArc[0][0] - cx);
  const angle1 = Math.atan2(onArc[1][1] - cy, onArc[1][0] - cx);
  let delta = angle1 - angle0;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  const points: [number, number, number][] = [];
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = angle0 + (delta * i) / ARC_SAMPLES;
    points.push([cx + side * Math.cos(t), cy + side * Math.sin(t), 0]);
  }
  return points;
}

export function WhirlingSquaresScene() {
  const { whirlingCount, setWhirlingInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { progress: stepProgress, setProgress: setStepProgress, playing: stepping, play, pause, reset, speed, setSpeed } = useBuildAnimation(STEP_DURATION_S);
  const countPoint = countAxis(whirlingCount);
  const { count } = localWhirlingSquares(countPoint);
  const allSquares = buildWhirlingSquares(count);

  // Steps through the construction one square at a time — each square's
  // own shape never depends on how many more come after it, so this is
  // exactly the same recursion, just paused partway through.
  const visibleCount = Math.max(1, Math.min(count, Math.round(stepProgress * count)));
  const squares = allSquares.slice(0, visibleCount);

  // center the whole construction near the origin
  const offsetX = -1.6;
  const offsetY = -0.5;

  return (
    <>
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="pointer-events-auto absolute left-3 top-3">
          <BuildControls
            label="Step through"
            playing={stepping}
            progress={stepProgress}
            onPlayPause={() => (stepping ? pause() : play())}
            onReset={reset}
            onScrub={setStepProgress}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </div>
      </Html>

      {squares.map((square, i) => (
        <Line
          key={`sq-${i}`}
          points={[
            [square.x0 + offsetX, square.y0 + offsetY, 0],
            [square.x1 + offsetX, square.y0 + offsetY, 0],
            [square.x1 + offsetX, square.y1 + offsetY, 0],
            [square.x0 + offsetX, square.y1 + offsetY, 0],
            [square.x0 + offsetX, square.y0 + offsetY, 0],
          ]}
          color="#475569"
          lineWidth={1}
        />
      ))}
      {squares.map((square, i) => (
        <Line
          key={`arc-${i}`}
          points={arcPoints(square).map(([x, y, z]) => [x + offsetX, y + offsetY, z])}
          color={ARC_COLOR}
          lineWidth={2.5}
        />
      ))}

      <DraggablePoint
        position={countPoint}
        color="#FFD166"
        id="whirlingCount"
        label={objectLabels.whirlingCount}
        onChange={(p) => {
          setWhirlingInput(countAxis(p));
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
