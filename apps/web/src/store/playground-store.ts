import { create } from "zustand";
import type {
  ClosestPointAABBResponse,
  IntersectRayAABBResponse,
  IntersectRayPlaneResponse,
  ProjectPointToPlaneResponse,
  QueryType,
  Vec3,
  SegmentSegmentResponse,
} from "@/types/geometry";

type SegmentResult = {
  point: Vec3;
  distance: number;
};

type PlaygroundState = {
  queryType: QueryType;

  // shared inputs
  point: Vec3;
  planePoint: Vec3;
  planeNormal: Vec3;

  rayOrigin: Vec3;
  rayDir: Vec3;

  // single segment
  segmentA: Vec3;
  segmentB: Vec3;

  // segment-segment inputs
  segmentA1: Vec3;
  segmentA2: Vec3;
  segmentB1: Vec3;
  segmentB2: Vec3;

  // AABB inputs (shared by intersect-ray-aabb and closest-point-aabb)
  aabbMin: Vec3;
  aabbMax: Vec3;

  // results
  projectPointResult: ProjectPointToPlaneResponse | null;
  rayPlaneResult: IntersectRayPlaneResponse | null;
  segmentResult: SegmentResult | null;
  segmentSegmentResult: SegmentSegmentResponse | null;
  rayAABBResult: IntersectRayAABBResponse | null;
  closestPointAABBResult: ClosestPointAABBResponse | null;

  error: string | null;
  shouldAutoRun: boolean;
  stepMode: boolean;

  // setters
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

  setSegmentSegmentInputs: (payload: {
    a1: Vec3;
    a2: Vec3;
    b1: Vec3;
    b2: Vec3;
  }) => void;

  setRayAABBInputs: (payload: {
    rayOrigin: Vec3;
    rayDir: Vec3;
    aabbMin: Vec3;
    aabbMax: Vec3;
  }) => void;

  setClosestPointAABBInputs: (payload: {
    point: Vec3;
    aabbMin: Vec3;
    aabbMax: Vec3;
  }) => void;

  setProjectPointResult: (result: ProjectPointToPlaneResponse | null) => void;
  setRayPlaneResult: (result: IntersectRayPlaneResponse | null) => void;
  setSegmentResult: (result: SegmentResult | null) => void;
  setSegmentSegmentResult: (
    result: SegmentSegmentResponse | null
  ) => void;
  setRayAABBResult: (result: IntersectRayAABBResponse | null) => void;
  setClosestPointAABBResult: (
    result: ClosestPointAABBResponse | null
  ) => void;

  setError: (error: string | null) => void;
  setStepMode: (v: boolean) => void;
  setShouldAutoRun: (v: boolean) => void;

  loadExample: (type: "ray-plane-hit" | "ray-plane-miss") => void;
};

// Clears every query type's result, used whenever the active query type
// changes or an error occurs, so a stale result from a different query
// can't linger in the results panel.
const clearedResults = {
  projectPointResult: null,
  rayPlaneResult: null,
  segmentResult: null,
  segmentSegmentResult: null,
  rayAABBResult: null,
  closestPointAABBResult: null,
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  queryType: "project-point-to-plane",

  // base inputs
  point: { x: 1, y: 2, z: 3 },
  planePoint: { x: 0, y: 0, z: 0 },
  planeNormal: { x: 0, y: 0, z: 1 },

  rayOrigin: { x: 0, y: 0, z: 5 },
  rayDir: { x: 0, y: 0, z: -1 },

  segmentA: { x: 0, y: 0, z: 0 },
  segmentB: { x: 3, y: 0, z: 0 },

  segmentA1: { x: 0, y: 0, z: 0 },
  segmentA2: { x: 3, y: 0, z: 0 },
  segmentB1: { x: 1, y: 2, z: 0 },
  segmentB2: { x: 1, y: -2, z: 0 },

  aabbMin: { x: 0, y: 0, z: 0 },
  aabbMax: { x: 2, y: 2, z: 2 },

  // results
  ...clearedResults,

  error: null,
  shouldAutoRun: false,
  stepMode: false,

  setQueryType: (queryType) =>
    set({
      queryType,
      ...clearedResults,
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

  setSegmentSegmentInputs: ({ a1, a2, b1, b2 }) =>
    set({
      segmentA1: a1,
      segmentA2: a2,
      segmentB1: b1,
      segmentB2: b2,
      segmentSegmentResult: null,
      error: null,
    }),

  setRayAABBInputs: ({ rayOrigin, rayDir, aabbMin, aabbMax }) =>
    set({
      rayOrigin,
      rayDir,
      aabbMin,
      aabbMax,
      rayAABBResult: null,
      error: null,
    }),

  setClosestPointAABBInputs: ({ point, aabbMin, aabbMax }) =>
    set({
      point,
      aabbMin,
      aabbMax,
      closestPointAABBResult: null,
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

  setRayAABBResult: (result) =>
    set({ rayAABBResult: result, error: null }),

  setClosestPointAABBResult: (result) =>
    set({ closestPointAABBResult: result, error: null }),

  setError: (error) =>
    set({
      error,
      ...clearedResults,
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
        ...clearedResults,
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
        ...clearedResults,
      });
    }
  },
}));
