"use client";

import { Html, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { localSquareCubeLaw } from "@/lib/local-geometry";

const SPHERE_COLOR = "#4ade80";
// Smaller and larger copies of the same shape, laid out beside the main
// interactive sphere — the whole law is only visible as a comparison
// across sizes, not in any single sphere on its own.
const COMPARISON_MULTIPLIERS = [0.5, 2, 4];
const GAP = 0.6;

export function SquareCubeLawScene() {
  const { magnitudePoint, setMagnitudeInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();
  const { radius, ratio } = localSquareCubeLaw(magnitudePoint);

  // Row laid out along -Y, each sphere offset past the cumulative diameters
  // of the ones before it so none of them overlap.
  const comparisons = COMPARISON_MULTIPLIERS.reduce<{ multiplier: number; r: number; y: number; ratio: number; cursorY: number }[]>((acc, multiplier) => {
    const previousCursor = acc.length > 0 ? acc[acc.length - 1].cursorY : -(radius + GAP);
    const r = radius * multiplier;
    const y = previousCursor - r;
    const { ratio: comparisonRatio } = localSquareCubeLaw({ x: r, y: 0, z: 0 });
    return [...acc, { multiplier, r, y, ratio: comparisonRatio, cursorY: y - r - GAP }];
  }, []);

  return (
    <>
      <Sphere args={[radius, 48, 48]}>
        <meshStandardMaterial color={SPHERE_COLOR} transparent opacity={0.28} wireframe={false} depthTest depthWrite={false} />
      </Sphere>
      <Sphere args={[radius, 24, 24]}>
        <meshStandardMaterial color={SPHERE_COLOR} wireframe transparent opacity={0.5} />
      </Sphere>
      <Html position={[0, radius + 0.35, 0]} center style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap rounded-md border border-slate-800 bg-slate-950/80 px-2 py-1 text-center font-mono text-[10px] font-bold text-emerald-200 backdrop-blur">
          S:V {ratio.toFixed(2)}
        </div>
      </Html>

      {comparisons.map(({ multiplier, r, y, ratio: comparisonRatio }) => (
        <group key={multiplier} position={[0, y, 0]}>
          <Sphere args={[r, 48, 48]}>
            <meshStandardMaterial color={SPHERE_COLOR} transparent opacity={0.28} depthTest depthWrite={false} />
          </Sphere>
          <Sphere args={[r, 24, 24]}>
            <meshStandardMaterial color={SPHERE_COLOR} wireframe transparent opacity={0.35} />
          </Sphere>
          <Html position={[0, -(r + 0.35), 0]} center style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-center font-mono text-[10px] font-semibold text-slate-300 backdrop-blur">
              {multiplier}× — S:V {comparisonRatio.toFixed(2)}
            </div>
          </Html>
        </group>
      ))}

      <DraggablePoint
        position={{ x: radius, y: 0, z: 0 }}
        color="#FFD166"
        id="magnitudePoint"
        label={objectLabels.magnitudePoint}
        onChange={(p) => {
          setMagnitudeInput(p);
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
