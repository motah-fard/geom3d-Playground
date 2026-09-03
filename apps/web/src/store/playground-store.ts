import { create } from "zustand";
import type {
  CartesianTransformResponse,
  ClosestPointAABBResponse,
  IntersectRayAABBResponse,
  IntersectRayPlaneResponse,
  ProjectPointToPlaneResponse,
  QueryType,
  Vec3,
  SegmentSegmentResponse,
} from "@/types/geometry";
import {
  DEFAULT_TRANSFORM_CORNERS,
  localCartesianTransform,
  localClosestPointAABB,
  localClosestPointSegment,
  localIntersectRayAABB,
  localIntersectRayPlane,
  localProjectPointToPlane,
  localSegmentSegment,
} from "@/lib/local-geometry";

type SegmentResult = {
  point: Vec3;
  distance: number;
};

export type ExampleType = QueryType | "ray-plane-hit" | "ray-plane-miss" | "point-inside-box" | "intersecting-segments" | "degenerate-segment" | "ray-box-miss";

export type ScenarioSnapshot = {
  version: 1;
  queryType: QueryType;
  point: Vec3;
  planePoint: Vec3;
  planeNormal: Vec3;
  rayOrigin: Vec3;
  rayDir: Vec3;
  segmentA: Vec3;
  segmentB: Vec3;
  segmentA1: Vec3;
  segmentA2: Vec3;
  segmentB1: Vec3;
  segmentB2: Vec3;
  aabbMin: Vec3;
  aabbMax: Vec3;
  transformP00: Vec3;
  transformP10: Vec3;
  transformP01: Vec3;
  transformP11: Vec3;
  stepMode: boolean;
  unit: "units" | "mm" | "cm" | "m";
  precision: number;
  snap: number;
  objectLabels: Record<string, string>;
};

type PlaygroundState = {
  version: 1;
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

  // Cartesian transformation grid corners
  transformP00: Vec3;
  transformP10: Vec3;
  transformP01: Vec3;
  transformP11: Vec3;

  // results
  projectPointResult: ProjectPointToPlaneResponse | null;
  rayPlaneResult: IntersectRayPlaneResponse | null;
  segmentResult: SegmentResult | null;
  segmentSegmentResult: SegmentSegmentResponse | null;
  rayAABBResult: IntersectRayAABBResponse | null;
  closestPointAABBResult: ClosestPointAABBResponse | null;
  transformResult: CartesianTransformResponse | null;

  error: string | null;
  shouldAutoRun: boolean;
  stepMode: boolean;
  queryStatus: "idle" | "running" | "success" | "error";
  isDragging: boolean;
  selectedObject: string | null;
  unit: ScenarioSnapshot["unit"];
  precision: number;
  snap: number;
  theme: "dark" | "light";
  objectLabels: Record<string, string>;
  past: ScenarioSnapshot[];
  future: ScenarioSnapshot[];

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

  setTransformInputs: (payload: {
    p00: Vec3;
    p10: Vec3;
    p01: Vec3;
    p11: Vec3;
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
  setTransformResult: (result: CartesianTransformResponse | null) => void;

  setError: (error: string | null) => void;
  setQueryStatus: (status: PlaygroundState["queryStatus"]) => void;
  setIsDragging: (isDragging: boolean) => void;
  setSelectedObject: (id: string | null) => void;
  setUnit: (unit: ScenarioSnapshot["unit"]) => void;
  setPrecision: (precision: number) => void;
  setSnap: (snap: number) => void;
  setTheme: (theme: PlaygroundState["theme"]) => void;
  setObjectLabel: (id: string, label: string) => void;
  saveCheckpoint: () => void;
  undo: () => void;
  redo: () => void;
  hydrateScenario: (snapshot: ScenarioSnapshot) => void;
  setStepMode: (v: boolean) => void;
  setShouldAutoRun: (v: boolean) => void;

  loadExample: (type: ExampleType) => void;
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
  transformResult: null,
};

function captureScenario(state: PlaygroundState): ScenarioSnapshot {
  return {
    version: 1,
    queryType: state.queryType,
    point: state.point,
    planePoint: state.planePoint,
    planeNormal: state.planeNormal,
    rayOrigin: state.rayOrigin,
    rayDir: state.rayDir,
    segmentA: state.segmentA,
    segmentB: state.segmentB,
    segmentA1: state.segmentA1,
    segmentA2: state.segmentA2,
    segmentB1: state.segmentB1,
    segmentB2: state.segmentB2,
    aabbMin: state.aabbMin,
    aabbMax: state.aabbMax,
    transformP00: state.transformP00,
    transformP10: state.transformP10,
    transformP01: state.transformP01,
    transformP11: state.transformP11,
    stepMode: state.stepMode,
    unit: state.unit,
    precision: state.precision,
    snap: state.snap,
    objectLabels: state.objectLabels,
  };
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  version: 1,
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

  transformP00: DEFAULT_TRANSFORM_CORNERS.p00,
  transformP10: DEFAULT_TRANSFORM_CORNERS.p10,
  transformP01: DEFAULT_TRANSFORM_CORNERS.p01,
  transformP11: DEFAULT_TRANSFORM_CORNERS.p11,

  // results
  ...clearedResults,

  error: null,
  shouldAutoRun: true,
  stepMode: false,
  queryStatus: "idle",
  isDragging: false,
  selectedObject: null,
  unit: "units",
  precision: 3,
  snap: 0.1,
  theme: "dark",
  objectLabels: {
    point: "P",
    rayOrigin: "O",
    segmentA: "A",
    segmentB: "B",
    segmentA1: "A₁",
    segmentA2: "A₂",
    segmentB1: "B₁",
    segmentB2: "B₂",
    transformP00: "P₀₀",
    transformP10: "P₁₀",
    transformP01: "P₀₁",
    transformP11: "P₁₁",
  },
  past: [],
  future: [],

  setQueryType: (queryType) =>
    set({
      queryType,
      ...clearedResults,
      error: null,
      queryStatus: "idle",
    }),

  setInputs: ({ point, planePoint, planeNormal }) =>
    set({
      point,
      planePoint,
      planeNormal,
      projectPointResult: localProjectPointToPlane({ point, plane: { point: planePoint, normal: planeNormal } }),
      queryStatus: "success",
      error: null,
    }),

  setRayInputs: ({ rayOrigin, rayDir, planePoint, planeNormal }) =>
    set({
      rayOrigin,
      rayDir,
      planePoint,
      planeNormal,
      rayPlaneResult: localIntersectRayPlane({ ray: { origin: rayOrigin, dir: rayDir }, plane: { point: planePoint, normal: planeNormal } }),
      queryStatus: "success",
      error: null,
    }),

  setSegmentInputs: ({ point, segmentA, segmentB }) =>
    set({
      point,
      segmentA,
      segmentB,
      segmentResult: localClosestPointSegment({ point, segment: { a: segmentA, b: segmentB } }),
      queryStatus: "success",
      error: null,
    }),

  setSegmentSegmentInputs: ({ a1, a2, b1, b2 }) =>
    set({
      segmentA1: a1,
      segmentA2: a2,
      segmentB1: b1,
      segmentB2: b2,
      segmentSegmentResult: localSegmentSegment({ a1, a2, b1, b2 }),
      queryStatus: "success",
      error: null,
    }),

  setRayAABBInputs: ({ rayOrigin, rayDir, aabbMin, aabbMax }) =>
    set({
      rayOrigin,
      rayDir,
      aabbMin,
      aabbMax,
      rayAABBResult: localIntersectRayAABB({ ray: { origin: rayOrigin, dir: rayDir }, aabb: { min: aabbMin, max: aabbMax } }),
      queryStatus: "success",
      error: null,
    }),

  setClosestPointAABBInputs: ({ point, aabbMin, aabbMax }) =>
    set({
      point,
      aabbMin,
      aabbMax,
      closestPointAABBResult: localClosestPointAABB({ point, aabb: { min: aabbMin, max: aabbMax } }),
      queryStatus: "success",
      error: null,
    }),

  setTransformInputs: ({ p00, p10, p01, p11 }) =>
    set({
      transformP00: p00,
      transformP10: p10,
      transformP01: p01,
      transformP11: p11,
      transformResult: localCartesianTransform({ p00, p10, p01, p11 }),
      queryStatus: "success",
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

  setTransformResult: (result) =>
    set({ transformResult: result, error: null }),

  setError: (error) =>
    set({
      error,
      queryStatus: error ? "error" : "idle",
    }),

  setQueryStatus: (queryStatus) => set({ queryStatus }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setSelectedObject: (selectedObject) => set({ selectedObject }),
  setUnit: (unit) => set({ unit }),
  setPrecision: (precision) => set({ precision: Math.max(0, Math.min(8, precision)) }),
  setSnap: (snap) => set({ snap: Math.max(0, Math.min(10, snap)) }),
  setTheme: (theme) => set({ theme }),
  setObjectLabel: (id, label) => set((state) => ({ objectLabels: { ...state.objectLabels, [id]: label.slice(0, 8) } })),
  saveCheckpoint: () => set((state) => ({ past: [...state.past.slice(-39), captureScenario(state)], future: [] })),
  undo: () => set((state) => {
    const previous = state.past.at(-1);
    if (!previous) return state;
    return {
      ...previous,
      past: state.past.slice(0, -1),
      future: [captureScenario(state), ...state.future].slice(0, 40),
      ...clearedResults,
      error: null,
      shouldAutoRun: true,
      queryStatus: "idle",
      selectedObject: null,
    };
  }),
  redo: () => set((state) => {
    const next = state.future[0];
    if (!next) return state;
    return {
      ...next,
      past: [...state.past.slice(-39), captureScenario(state)],
      future: state.future.slice(1),
      ...clearedResults,
      error: null,
      shouldAutoRun: true,
      queryStatus: "idle",
      selectedObject: null,
    };
  }),
  hydrateScenario: (snapshot) => set((state) => ({
    ...snapshot,
    unit: snapshot.unit ?? state.unit,
    precision: snapshot.precision ?? state.precision,
    snap: snapshot.snap ?? state.snap,
    objectLabels: { ...state.objectLabels, ...(snapshot.objectLabels ?? {}) },
    past: [...state.past.slice(-39), captureScenario(state)],
    future: [],
    ...clearedResults,
    error: null,
    shouldAutoRun: true,
    queryStatus: "idle",
    selectedObject: null,
  })),
  setStepMode: (v) => set({ stepMode: v }),
  setShouldAutoRun: (v) => set({ shouldAutoRun: v }),

  loadExample: (type) => {
    usePlaygroundStore.getState().saveCheckpoint();
    if (type === "project-point-to-plane") {
      set({
        queryType: type,
        point: { x: 1, y: 2, z: 3 },
        planePoint: { x: 0, y: 0, z: 0 },
        planeNormal: { x: 0, y: 0, z: 1 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "intersect-ray-plane" || type === "ray-plane-hit") {
      set({
        queryType: "intersect-ray-plane",
        rayOrigin: { x: 0, y: 0, z: 5 },
        rayDir: { x: 0, y: 0, z: -1 },
        planePoint: { x: 0, y: 0, z: 0 },
        planeNormal: { x: 0, y: 0, z: 1 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
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
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "closest-point-segment") {
      set({
        queryType: type,
        point: { x: 1, y: 2, z: 3 },
        segmentA: { x: -2, y: 0, z: 0 },
        segmentB: { x: 3, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "segment-segment") {
      set({
        queryType: type,
        segmentA1: { x: -2, y: 0, z: 0 },
        segmentA2: { x: 2, y: 0, z: 0 },
        segmentB1: { x: 0, y: -2, z: 2 },
        segmentB2: { x: 0, y: 2, z: 2 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "intersect-ray-aabb") {
      set({
        queryType: type,
        rayOrigin: { x: -4, y: 1, z: 1 },
        rayDir: { x: 1, y: 0, z: 0 },
        aabbMin: { x: 0, y: 0, z: 0 },
        aabbMax: { x: 2, y: 2, z: 2 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "closest-point-aabb") {
      set({
        queryType: type,
        point: { x: 4, y: 3, z: 3 },
        aabbMin: { x: 0, y: 0, z: 0 },
        aabbMax: { x: 2, y: 2, z: 2 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "point-inside-box") {
      set({ queryType: "closest-point-aabb", point: { x: 1, y: 1, z: 1 }, aabbMin: { x: 0, y: 0, z: 0 }, aabbMax: { x: 2, y: 2, z: 2 }, shouldAutoRun: true, error: null, queryStatus: "idle", ...clearedResults });
    }
    if (type === "intersecting-segments") {
      set({ queryType: "segment-segment", segmentA1: { x: -2, y: 0, z: 0 }, segmentA2: { x: 2, y: 0, z: 0 }, segmentB1: { x: 0, y: -2, z: 0 }, segmentB2: { x: 0, y: 2, z: 0 }, shouldAutoRun: true, error: null, queryStatus: "idle", ...clearedResults });
    }
    if (type === "degenerate-segment") {
      set({ queryType: "closest-point-segment", point: { x: 2, y: 2, z: 1 }, segmentA: { x: 0, y: 0, z: 0 }, segmentB: { x: 0, y: 0, z: 0 }, shouldAutoRun: true, error: null, queryStatus: "idle", ...clearedResults });
    }
    if (type === "cartesian-transform") {
      set({
        queryType: type,
        transformP00: DEFAULT_TRANSFORM_CORNERS.p00,
        transformP10: DEFAULT_TRANSFORM_CORNERS.p10,
        transformP01: DEFAULT_TRANSFORM_CORNERS.p01,
        transformP11: DEFAULT_TRANSFORM_CORNERS.p11,
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "ray-box-miss") {
      set({ queryType: "intersect-ray-aabb", rayOrigin: { x: -4, y: 4, z: 1 }, rayDir: { x: 1, y: 0, z: 0 }, aabbMin: { x: 0, y: 0, z: 0 }, aabbMax: { x: 2, y: 2, z: 2 }, shouldAutoRun: true, error: null, queryStatus: "idle", ...clearedResults });
    }
  },
}));

export function getScenarioSnapshot() {
  return captureScenario(usePlaygroundStore.getState());
}
