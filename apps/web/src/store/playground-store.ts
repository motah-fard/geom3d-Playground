import { create } from "zustand";
import type {
  IntersectRayPlaneResponse,
  ProjectPointToPlaneResponse,
  Vec3,
  SegmentSegmentResponse,
} from "@/types/geometry";

type QueryType =
  | "project-point-to-plane"
  | "intersect-ray-plane"
  | "closest-point-segment"
  | "segment-segment";

type SegmentResult = {
  point: Vec3;
  distance: number;
};

type PlaygroundState = {
  queryType: QueryType;

  // 🔹 shared inputs
  point: Vec3;
  planePoint: Vec3;
  planeNormal: Vec3;

  rayOrigin: Vec3;
  rayDir: Vec3;

  // 🔹 single segment
  segmentA: Vec3;
  segmentB: Vec3;

  // 🔥 NEW: segment-segment inputs
  segmentA1: Vec3;
  segmentA2: Vec3;
  segmentB1: Vec3;
  segmentB2: Vec3;

  // 🔹 results
  projectPointResult: ProjectPointToPlaneResponse | null;
  rayPlaneResult: IntersectRayPlaneResponse | null;
  segmentResult: SegmentResult | null;
  segmentSegmentResult: SegmentSegmentResponse | null;

  error: string | null;
  shouldAutoRun: boolean;
  stepMode: boolean;

  // 🔹 setters
  setQueryType: (queryType: QueryType) => void;

  setInputs: (payload: {
    point: Vec3;
    planePoint: Vec3;
    planeNormal: Vec3;
  }) => void;

  setRayInputs: (payload: {
    rayOrigin: Vec3;
    rayDir: Vec3;
    planePoint: Vec3;
    planeNormal: Vec3;
  }) => void;

  setSegmentInputs: (payload: {
    point: Vec3;
    segmentA: Vec3;
    segmentB: Vec3;
  }) => void;

  // 🔥 NEW
  setSegmentSegmentInputs: (payload: {
    a1: Vec3;
    a2: Vec3;
    b1: Vec3;
    b2: Vec3;
  }) => void;

  setProjectPointResult: (result: ProjectPointToPlaneResponse | null) => void;
  setRayPlaneResult: (result: IntersectRayPlaneResponse | null) => void;
  setSegmentResult: (result: SegmentResult | null) => void;
  setSegmentSegmentResult: (
    result: SegmentSegmentResponse | null
  ) => void;

  setError: (error: string | null) => void;
  setStepMode: (v: boolean) => void;
  setShouldAutoRun: (v: boolean) => void;

  loadExample: (type: "ray-plane-hit" | "ray-plane-miss") => void;
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  queryType: "project-point-to-plane",

  // 🔹 base inputs
  point: { x: 1, y: 2, z: 3 },
  planePoint: { x: 0, y: 0, z: 0 },
  planeNormal: { x: 0, y: 0, z: 1 },

  rayOrigin: { x: 0, y: 0, z: 5 },
  rayDir: { x: 0, y: 0, z: -1 },

  segmentA: { x: 0, y: 0, z: 0 },
  segmentB: { x: 3, y: 0, z: 0 },

  // 🔥 NEW defaults (important for scene rendering)
  segmentA1: { x: 0, y: 0, z: 0 },
  segmentA2: { x: 3, y: 0, z: 0 },
  segmentB1: { x: 1, y: 2, z: 0 },
  segmentB2: { x: 1, y: -2, z: 0 },

  // 🔹 results
  projectPointResult: null,
  rayPlaneResult: null,
  segmentResult: null,
  segmentSegmentResult: null,

  error: null,
  shouldAutoRun: false,
  stepMode: false,

  setQueryType: (queryType) =>
    set({
      queryType,
      projectPointResult: null,
      rayPlaneResult: null,
      segmentResult: null,
      segmentSegmentResult: null,
      error: null,
    }),

  setInputs: ({ point, planePoint, planeNormal }) =>
    set({
      point,
      planePoint,
      planeNormal,
      projectPointResult: null,
      error: null,
    }),

  setRayInputs: ({ rayOrigin, rayDir, planePoint, planeNormal }) =>
    set({
      rayOrigin,
      rayDir,
      planePoint,
      planeNormal,
      rayPlaneResult: null,
      error: null,
    }),

  setSegmentInputs: ({ point, segmentA, segmentB }) =>
    set({
      point,
      segmentA,
      segmentB,
      segmentResult: null,
      error: null,
    }),

  // 🔥 CRITICAL FIX
  setSegmentSegmentInputs: ({ a1, a2, b1, b2 }) =>
    set({
      segmentA1: a1,
      segmentA2: a2,
      segmentB1: b1,
      segmentB2: b2,
      segmentSegmentResult: null,
      error: null,
    }),

  setProjectPointResult: (result) =>
    set({ projectPointResult: result, error: null }),

  setRayPlaneResult: (result) =>
    set({ rayPlaneResult: result, error: null }),

  setSegmentResult: (result) =>
    set({ segmentResult: result, error: null }),

  setSegmentSegmentResult: (result) =>
    set({ segmentSegmentResult: result, error: null }),

  setError: (error) =>
    set({
      error,
      projectPointResult: null,
      rayPlaneResult: null,
      segmentResult: null,
      segmentSegmentResult: null,
    }),

  setStepMode: (v) => set({ stepMode: v }),
  setShouldAutoRun: (v) => set({ shouldAutoRun: v }),

  loadExample: (type) => {
    if (type === "ray-plane-hit") {
      set({
        queryType: "intersect-ray-plane",
        rayOrigin: { x: 0, y: 0, z: 5 },
        rayDir: { x: 0, y: 0, z: -1 },
        planePoint: { x: 0, y: 0, z: 0 },
        planeNormal: { x: 0, y: 0, z: 1 },
        shouldAutoRun: true,
        error: null,
        projectPointResult: null,
        rayPlaneResult: null,
        segmentSegmentResult: null,
      });
    }

    if (type === "ray-plane-miss") {
      set({
        queryType: "intersect-ray-plane",
        rayOrigin: { x: 0, y: 0, z: 5 },
        rayDir: { x: 1, y: 0, z: 0 },
        planePoint: { x: 0, y: 0, z: 0 },
        planeNormal: { x: 0, y: 0, z: 1 },
        shouldAutoRun: true,
        error: null,
        projectPointResult: null,
        rayPlaneResult: null,
        segmentSegmentResult: null,
      });
    }
  },
}));