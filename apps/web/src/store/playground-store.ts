import { create } from "zustand";
import type {
  IntersectRayPlaneResponse,
  ProjectPointToPlaneResponse,
  Vec3,
} from "@/types/geometry";

type QueryType =
  | "project-point-to-plane"
  | "intersect-ray-plane"
  | "closest-point-segment";

type SegmentResult = {
  point: Vec3;
  distance: number;
};

type PlaygroundState = {
  queryType: QueryType;

  point: Vec3;
  planePoint: Vec3;
  planeNormal: Vec3;

  rayOrigin: Vec3;
  rayDir: Vec3;

  segmentA: Vec3;
  segmentB: Vec3;

  // ✅ separated results (this fixes your bugs)
  projectPointResult: ProjectPointToPlaneResponse | null;
  rayPlaneResult: IntersectRayPlaneResponse | null;
  segmentResult: SegmentResult | null;

  error: string | null;
  shouldAutoRun: boolean;

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

  // ✅ setters per query
  setProjectPointResult: (
    result: ProjectPointToPlaneResponse | null
  ) => void;

  setRayPlaneResult: (
    result: IntersectRayPlaneResponse | null
  ) => void;

  setSegmentResult: (result: SegmentResult | null) => void;

  setError: (error: string | null) => void;
  setShouldAutoRun: (v: boolean) => void;

  loadExample: (type: "ray-plane-hit" | "ray-plane-miss") => void;
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  queryType: "project-point-to-plane",

  point: { x: 1, y: 2, z: 3 },
  planePoint: { x: 0, y: 0, z: 0 },
  planeNormal: { x: 0, y: 0, z: 1 },

  rayOrigin: { x: 0, y: 0, z: 5 },
  rayDir: { x: 0, y: 0, z: -1 },

  segmentA: { x: 0, y: 0, z: 0 },
  segmentB: { x: 3, y: 0, z: 0 },

  // ✅ initialized properly
  projectPointResult: null,
  rayPlaneResult: null,
  segmentResult: null,

  error: null,
  shouldAutoRun: false,

  setQueryType: (queryType) =>
    set({
      queryType,
      projectPointResult: null,
      rayPlaneResult: null,
      segmentResult: null,
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

  // ✅ correct setters
  setProjectPointResult: (result) =>
  set({ projectPointResult: result, error: null }),

  setRayPlaneResult: (rayPlaneResult) =>
    set({ rayPlaneResult, error: null }),

  setSegmentResult: (segmentResult) =>
    set({ segmentResult, error: null }),

  setError: (error) =>
    set({
      error,
      projectPointResult: null,
      rayPlaneResult: null,
      segmentResult: null,
    }),

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
      });
    }
  },
}));