"use client";

import { Html, Line } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { toTuple, type Vec3 } from "@/types/geometry";

export function MeasurementLine({ start, end, label = "distance" }: { start: Vec3; end: Vec3; label?: string }) {
  const { precision, unit } = usePlaygroundStore();
  const midpoint: [number, number, number] = [(start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2];
  const distance = Math.hypot(end.x - start.x, end.y - start.y, end.z - start.z);
  return (
    <>
      <Line points={[toTuple(start), toTuple(end)]} color="#fb923c" lineWidth={2} dashed dashSize={0.18} gapSize={0.1} />
      <Html center position={midpoint} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded-md border border-orange-300/20 bg-slate-950/90 px-2 py-1 font-mono text-[10px] text-orange-100 shadow-xl">{label} {Number(distance.toFixed(precision))} {unit}</span>
      </Html>
    </>
  );
}
