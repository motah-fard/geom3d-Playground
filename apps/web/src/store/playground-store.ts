import { create } from "zustand";
import type {
  AllometricGrowthResponse,
  CartesianTransformResponse,
  CatenaryResponse,
  CatenoidResponse,
  CellPackingResponse,
  ClosestPointAABBResponse,
  EggCurveResponse,
  GeodesicSphereResponse,
  HelicalShellResponse,
  HelicoidResponse,
  IntersectRayAABBResponse,
  IntersectRayPlaneResponse,
  LogisticGrowthResponse,
  LogSpiralResponse,
  MagnitudeScalingResponse,
  MilkCoronetResponse,
  PhyllotaxisResponse,
  ProjectPointToPlaneResponse,
  QueryType,
  Vec3,
  SegmentSegmentResponse,
  WhirlingSquaresResponse,
} from "@/types/geometry";
import {
  CATENARY_HALF_SPAN,
  DEFAULT_TRANSFORM_CORNERS,
  localAllometricGrowth,
  localCartesianTransform,
  localCatenary,
  localCatenoid,
  localCellPacking,
  localClosestPointAABB,
  localClosestPointSegment,
  localEggCurve,
  localGeodesicSphere,
  localHelicalShell,
  localHelicoid,
  localIntersectRayAABB,
  localIntersectRayPlane,
  localLogisticGrowth,
  localLogSpiral,
  localMilkCoronet,
  localPhyllotaxis,
  localProjectPointToPlane,
  localSegmentSegment,
  localSquareCubeLaw,
  localWhirlingSquares,
  PHYLLOTAXIS_DIAL_RADIUS,
  GOLDEN_ANGLE_RAD,
  LOGISTIC_TIME_SPAN,
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
  spiralStart: Vec3;
  spiralTurn: Vec3;
  cellCenter: Vec3;
  helixStart: Vec3;
  helixTurn: Vec3;
  magnitudePoint: Vec3;
  catenaryA: Vec3;
  allometrySize: Vec3;
  allometryExponent: Vec3;
  phyllotaxisDivergence: Vec3;
  logisticR: Vec3;
  logisticK: Vec3;
  geodesicDetail: Vec3;
  whirlingCount: Vec3;
  catenoidA: Vec3;
  milkRadius: Vec3;
  milkCount: Vec3;
  eggBig: Vec3;
  eggSmall: Vec3;
  helicoidRadius: Vec3;
  helicoidPitch: Vec3;
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

  // logarithmic spiral control points
  spiralStart: Vec3;
  spiralTurn: Vec3;

  // cell-packing growth center
  cellCenter: Vec3;

  // helical shell control points
  helixStart: Vec3;
  helixTurn: Vec3;

  // square-cube law scale point
  magnitudePoint: Vec3;

  // catenary parameter point
  catenaryA: Vec3;

  // allometric growth control points
  allometrySize: Vec3;
  allometryExponent: Vec3;

  // phyllotaxis divergence dial
  phyllotaxisDivergence: Vec3;

  // logistic growth control points
  logisticR: Vec3;
  logisticK: Vec3;

  // geodesic sphere subdivision control
  geodesicDetail: Vec3;

  // whirling-squares count control
  whirlingCount: Vec3;

  // catenoid parameter point
  catenoidA: Vec3;

  // milk-coronet control points
  milkRadius: Vec3;
  milkCount: Vec3;

  // egg control points
  eggBig: Vec3;
  eggSmall: Vec3;

  // helicoid control points
  helicoidRadius: Vec3;
  helicoidPitch: Vec3;

  // results
  projectPointResult: ProjectPointToPlaneResponse | null;
  rayPlaneResult: IntersectRayPlaneResponse | null;
  segmentResult: SegmentResult | null;
  segmentSegmentResult: SegmentSegmentResponse | null;
  rayAABBResult: IntersectRayAABBResponse | null;
  closestPointAABBResult: ClosestPointAABBResponse | null;
  transformResult: CartesianTransformResponse | null;
  spiralResult: LogSpiralResponse | null;
  cellResult: CellPackingResponse | null;
  phyllotaxisResult: PhyllotaxisResponse | null;
  logisticResult: LogisticGrowthResponse | null;
  geodesicResult: GeodesicSphereResponse | null;
  whirlingResult: WhirlingSquaresResponse | null;
  catenoidResult: CatenoidResponse | null;
  helixResult: HelicalShellResponse | null;
  magnitudeResult: MagnitudeScalingResponse | null;
  catenaryResult: CatenaryResponse | null;
  allometryResult: AllometricGrowthResponse | null;
  milkCoronetResult: MilkCoronetResponse | null;
  eggCurveResult: EggCurveResponse | null;
  helicoidResult: HelicoidResponse | null;

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

  setSpiralInputs: (payload: { start: Vec3; turn: Vec3 }) => void;
  setCellCenterInput: (center: Vec3) => void;
  setHelixInputs: (payload: { start: Vec3; turn: Vec3 }) => void;
  setMagnitudeInput: (point: Vec3) => void;
  setCatenaryInput: (aPoint: Vec3) => void;
  setAllometryInputs: (payload: { sizePoint: Vec3; exponentPoint: Vec3 }) => void;
  setPhyllotaxisInput: (divergencePoint: Vec3) => void;
  setLogisticInputs: (payload: { rPoint: Vec3; kPoint: Vec3 }) => void;
  setGeodesicInput: (detailPoint: Vec3) => void;
  setWhirlingInput: (countPoint: Vec3) => void;
  setCatenoidInput: (aPoint: Vec3) => void;
  setMilkCoronetInputs: (payload: { radiusPoint: Vec3; countPoint: Vec3 }) => void;
  setEggCurveInputs: (payload: { bigPoint: Vec3; smallPoint: Vec3 }) => void;
  setHelicoidInputs: (payload: { radiusPoint: Vec3; pitchPoint: Vec3 }) => void;

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
  setSpiralResult: (result: LogSpiralResponse | null) => void;
  setCellResult: (result: CellPackingResponse | null) => void;
  setHelixResult: (result: HelicalShellResponse | null) => void;
  setMagnitudeResult: (result: MagnitudeScalingResponse | null) => void;
  setCatenaryResult: (result: CatenaryResponse | null) => void;
  setAllometryResult: (result: AllometricGrowthResponse | null) => void;
  setPhyllotaxisResult: (result: PhyllotaxisResponse | null) => void;
  setLogisticResult: (result: LogisticGrowthResponse | null) => void;
  setGeodesicResult: (result: GeodesicSphereResponse | null) => void;
  setWhirlingResult: (result: WhirlingSquaresResponse | null) => void;
  setCatenoidResult: (result: CatenoidResponse | null) => void;
  setMilkCoronetResult: (result: MilkCoronetResponse | null) => void;
  setEggCurveResult: (result: EggCurveResponse | null) => void;
  setHelicoidResult: (result: HelicoidResponse | null) => void;

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
  spiralResult: null,
  cellResult: null,
  helixResult: null,
  magnitudeResult: null,
  catenaryResult: null,
  allometryResult: null,
  phyllotaxisResult: null,
  logisticResult: null,
  geodesicResult: null,
  whirlingResult: null,
  catenoidResult: null,
  milkCoronetResult: null,
  eggCurveResult: null,
  helicoidResult: null,
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
    spiralStart: state.spiralStart,
    spiralTurn: state.spiralTurn,
    cellCenter: state.cellCenter,
    helixStart: state.helixStart,
    helixTurn: state.helixTurn,
    magnitudePoint: state.magnitudePoint,
    catenaryA: state.catenaryA,
    allometrySize: state.allometrySize,
    allometryExponent: state.allometryExponent,
    phyllotaxisDivergence: state.phyllotaxisDivergence,
    logisticR: state.logisticR,
    logisticK: state.logisticK,
    geodesicDetail: state.geodesicDetail,
    whirlingCount: state.whirlingCount,
    catenoidA: state.catenoidA,
    milkRadius: state.milkRadius,
    milkCount: state.milkCount,
    eggBig: state.eggBig,
    eggSmall: state.eggSmall,
    helicoidRadius: state.helicoidRadius,
    helicoidPitch: state.helicoidPitch,
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

  spiralStart: { x: 1, y: 0, z: 0 },
  spiralTurn: { x: 1.4, y: 0, z: 0 },

  cellCenter: { x: 0, y: 0, z: 0 },

  helixStart: { x: 1, y: 0, z: 0 },
  helixTurn: { x: 1.3, y: 0, z: 1.2 },

  magnitudePoint: { x: 1.5, y: 0, z: 0 },

  catenaryA: { x: 1.5, y: 0, z: 0 },

  allometrySize: { x: 1, y: 0, z: 0 },
  allometryExponent: { x: 1.8, y: 0, z: 0 },

  phyllotaxisDivergence: {
    x: PHYLLOTAXIS_DIAL_RADIUS * Math.cos(GOLDEN_ANGLE_RAD),
    y: PHYLLOTAXIS_DIAL_RADIUS * Math.sin(GOLDEN_ANGLE_RAD),
    z: 0,
  },

  logisticR: { x: 0.8, y: 0, z: 0 },
  logisticK: { x: LOGISTIC_TIME_SPAN, y: 8, z: 0 },

  geodesicDetail: { x: 2, y: 0, z: 0 },

  whirlingCount: { x: 8, y: 0, z: 0 },

  catenoidA: { x: 1.2, y: 0, z: 0 },

  milkRadius: { x: 2.4, y: 0, z: 0 },
  milkCount: { x: 14, y: 0, z: 0 },

  eggBig: { x: 1.4, y: 0, z: 0 },
  eggSmall: { x: 0.7, y: 0, z: 0 },

  helicoidRadius: { x: 1.8, y: 0, z: 0 },
  helicoidPitch: { x: 0, y: 0, z: 2.4 },

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
    spiralStart: "S",
    spiralTurn: "T",
    cellCenter: "C",
    helixStart: "S",
    helixTurn: "T",
    magnitudePoint: "R",
    catenaryA: "A",
    allometrySize: "X",
    allometryExponent: "K",
    phyllotaxisDivergence: "D",
    logisticR: "R",
    logisticK: "K",
    geodesicDetail: "F",
    whirlingCount: "N",
    catenoidA: "A",
    milkRadius: "R",
    milkCount: "N",
    eggBig: "R",
    eggSmall: "r",
    helicoidRadius: "R",
    helicoidPitch: "P",
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

  setSpiralInputs: ({ start, turn }) =>
    set({
      spiralStart: start,
      spiralTurn: turn,
      spiralResult: localLogSpiral({ start, turn }),
      queryStatus: "success",
      error: null,
    }),

  setCellCenterInput: (center) =>
    set({
      cellCenter: center,
      cellResult: localCellPacking(center),
      queryStatus: "success",
      error: null,
    }),

  setHelixInputs: ({ start, turn }) =>
    set({
      helixStart: start,
      helixTurn: turn,
      helixResult: localHelicalShell({ start, turn }),
      queryStatus: "success",
      error: null,
    }),

  setMagnitudeInput: (point) =>
    set({
      magnitudePoint: point,
      magnitudeResult: localSquareCubeLaw(point),
      queryStatus: "success",
      error: null,
    }),

  setCatenaryInput: (aPoint) =>
    set({
      catenaryA: aPoint,
      catenaryResult: localCatenary(aPoint, CATENARY_HALF_SPAN),
      queryStatus: "success",
      error: null,
    }),

  setAllometryInputs: ({ sizePoint, exponentPoint }) =>
    set({
      allometrySize: sizePoint,
      allometryExponent: exponentPoint,
      allometryResult: localAllometricGrowth(sizePoint, exponentPoint),
      queryStatus: "success",
      error: null,
    }),

  setPhyllotaxisInput: (divergencePoint) =>
    set({
      phyllotaxisDivergence: divergencePoint,
      phyllotaxisResult: localPhyllotaxis(divergencePoint),
      queryStatus: "success",
      error: null,
    }),

  setLogisticInputs: ({ rPoint, kPoint }) =>
    set({
      logisticR: rPoint,
      logisticK: kPoint,
      logisticResult: localLogisticGrowth(rPoint, kPoint),
      queryStatus: "success",
      error: null,
    }),

  setGeodesicInput: (detailPoint) =>
    set({
      geodesicDetail: detailPoint,
      geodesicResult: localGeodesicSphere(Math.hypot(detailPoint.x, detailPoint.y)),
      queryStatus: "success",
      error: null,
    }),

  setWhirlingInput: (countPoint) =>
    set({
      whirlingCount: countPoint,
      whirlingResult: localWhirlingSquares(countPoint),
      queryStatus: "success",
      error: null,
    }),

  setCatenoidInput: (aPoint) =>
    set({
      catenoidA: aPoint,
      catenoidResult: localCatenoid(aPoint),
      queryStatus: "success",
      error: null,
    }),

  setMilkCoronetInputs: ({ radiusPoint, countPoint }) =>
    set({
      milkRadius: radiusPoint,
      milkCount: countPoint,
      milkCoronetResult: localMilkCoronet(radiusPoint, countPoint),
      queryStatus: "success",
      error: null,
    }),

  setEggCurveInputs: ({ bigPoint, smallPoint }) =>
    set({
      eggBig: bigPoint,
      eggSmall: smallPoint,
      eggCurveResult: localEggCurve(bigPoint, smallPoint),
      queryStatus: "success",
      error: null,
    }),

  setHelicoidInputs: ({ radiusPoint, pitchPoint }) =>
    set({
      helicoidRadius: radiusPoint,
      helicoidPitch: pitchPoint,
      helicoidResult: localHelicoid(radiusPoint, pitchPoint),
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

  setSpiralResult: (result) =>
    set({ spiralResult: result, error: null }),

  setCellResult: (result) =>
    set({ cellResult: result, error: null }),

  setHelixResult: (result) =>
    set({ helixResult: result, error: null }),

  setMagnitudeResult: (result) =>
    set({ magnitudeResult: result, error: null }),

  setCatenaryResult: (result) =>
    set({ catenaryResult: result, error: null }),

  setAllometryResult: (result) =>
    set({ allometryResult: result, error: null }),

  setPhyllotaxisResult: (result) =>
    set({ phyllotaxisResult: result, error: null }),

  setLogisticResult: (result) =>
    set({ logisticResult: result, error: null }),

  setGeodesicResult: (result) =>
    set({ geodesicResult: result, error: null }),

  setWhirlingResult: (result) =>
    set({ whirlingResult: result, error: null }),

  setCatenoidResult: (result) =>
    set({ catenoidResult: result, error: null }),

  setMilkCoronetResult: (result) =>
    set({ milkCoronetResult: result, error: null }),

  setEggCurveResult: (result) =>
    set({ eggCurveResult: result, error: null }),

  setHelicoidResult: (result) =>
    set({ helicoidResult: result, error: null }),

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

    if (type === "log-spiral-growth") {
      set({
        queryType: type,
        spiralStart: { x: 1, y: 0, z: 0 },
        spiralTurn: { x: 1.4, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "cell-packing") {
      set({
        queryType: type,
        cellCenter: { x: 0, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "helical-shell-growth") {
      set({
        queryType: type,
        helixStart: { x: 1, y: 0, z: 0 },
        helixTurn: { x: 1.3, y: 0, z: 1.2 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "square-cube-law") {
      set({
        queryType: type,
        magnitudePoint: { x: 1.5, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "catenary-arch") {
      set({
        queryType: type,
        catenaryA: { x: 1.5, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "allometric-growth") {
      set({
        queryType: type,
        allometrySize: { x: 1, y: 0, z: 0 },
        allometryExponent: { x: 1.8, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "phyllotaxis") {
      set({
        queryType: type,
        phyllotaxisDivergence: {
          x: PHYLLOTAXIS_DIAL_RADIUS * Math.cos(GOLDEN_ANGLE_RAD),
          y: PHYLLOTAXIS_DIAL_RADIUS * Math.sin(GOLDEN_ANGLE_RAD),
          z: 0,
        },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "logistic-growth") {
      set({
        queryType: type,
        logisticR: { x: 0.8, y: 0, z: 0 },
        logisticK: { x: LOGISTIC_TIME_SPAN, y: 8, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "geodesic-sphere") {
      set({
        queryType: type,
        geodesicDetail: { x: 2, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "whirling-squares") {
      set({
        queryType: type,
        whirlingCount: { x: 8, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "catenoid") {
      set({
        queryType: type,
        catenoidA: { x: 1.2, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "milk-coronet") {
      set({
        queryType: type,
        milkRadius: { x: 2.4, y: 0, z: 0 },
        milkCount: { x: 14, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "egg-curve") {
      set({
        queryType: type,
        eggBig: { x: 1.4, y: 0, z: 0 },
        eggSmall: { x: 0.7, y: 0, z: 0 },
        shouldAutoRun: true,
        error: null,
        queryStatus: "idle",
        ...clearedResults,
      });
    }

    if (type === "helicoid") {
      set({
        queryType: type,
        helicoidRadius: { x: 1.8, y: 0, z: 0 },
        helicoidPitch: { x: 0, y: 0, z: 2.4 },
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
