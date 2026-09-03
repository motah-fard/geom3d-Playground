"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line, Sphere } from "@react-three/drei";
import { usePlaygroundStore } from "@/store/playground-store";
import { DraggablePoint } from "../primitives/DraggablePoint";
import { toTuple } from "@/types/geometry";
import { CELL_RING_SITES, voronoiCell } from "@/lib/local-geometry";

export function CellPackingScene() {
  const { cellCenter, setCellCenterInput, setShouldAutoRun, objectLabels } = usePlaygroundStore();

  const cell = useMemo(() => voronoiCell(cellCenter, CELL_RING_SITES), [cellCenter]);

  const cellGeometry = useMemo(() => {
    if (cell.length < 3) return null;
    const shape = new THREE.Shape();
    shape.moveTo(cell[0].x, cell[0].y);
    for (const point of cell.slice(1)) shape.lineTo(point.x, point.y);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [cell]);

  return (
    <>
      {/* fixed neighboring growth centers */}
      {CELL_RING_SITES.map((site, i) => (
        <Sphere key={i} args={[0.12, 16, 16]} position={toTuple(site)}>
          <meshStandardMaterial color="#64748b" depthTest depthWrite />
        </Sphere>
      ))}

      {/* the growth center's Voronoi cell */}
      {cellGeometry && (
        <mesh geometry={cellGeometry}>
          <meshBasicMaterial color="orange" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      )}
      {cell.length >= 3 && (
        <Line points={[...cell.map((p) => toTuple(p)), toTuple(cell[0])]} color="orange" lineWidth={2.5} />
      )}

      <DraggablePoint
        position={cellCenter}
        color="hotpink"
        id="cellCenter"
        label={objectLabels.cellCenter}
        onChange={(p) => {
          setCellCenterInput(p);
          setShouldAutoRun(true);
        }}
      />
    </>
  );
}
