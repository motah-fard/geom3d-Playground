"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3 } from "@/types/geometry";

export function VectorArrow({ origin, direction, length = 8, color = "#29C7E8" }: { origin: Vec3; direction: Vec3; length?: number; color?: string }) {
  const arrow = useMemo(() => {
    const dir = new THREE.Vector3(direction.x, direction.y, direction.z);
    if (dir.lengthSq() === 0) dir.set(1, 0, 0);
    dir.normalize();
    return new THREE.ArrowHelper(dir, new THREE.Vector3(origin.x, origin.y, origin.z), length, color, 0.45, 0.22);
  }, [origin.x, origin.y, origin.z, direction.x, direction.y, direction.z, length, color]);
  return <primitive object={arrow} />;
}
