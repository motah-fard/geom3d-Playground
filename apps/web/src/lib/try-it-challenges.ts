import type { PlaygroundState } from "@/store/playground-store";
import type { QueryType } from "@/types/geometry";

export type TryItChallenge = {
  prompt: string;
  isSolved: (state: PlaygroundState) => boolean;
};

// A hands-on task with an automatically-detected success condition — no
// multiple choice, just "make the scene do this" and a live check against
// the same computed result the results panel already shows. Deliberately
// starts with a curated handful of chapters rather than all 31: each
// condition has to be genuinely reachable by dragging, not just numerically
// possible, so every entry here has been checked against its chapter's own
// input ranges.
export const TRY_IT_CHALLENGES: Partial<Record<QueryType, TryItChallenge>> = {
  angles: {
    prompt: "Try it: swing ray B until the angle is exactly 90°.",
    isSolved: (state) => state.angleResult !== null && Math.abs(state.angleResult.angleDeg - 90) < 0.5,
  },
  "pythagorean-theorem": {
    prompt: "Try it: make an isosceles right triangle — both legs the same length.",
    isSolved: (state) => state.pythagoreanResult !== null && state.pythagoreanResult.triangleType === "isosceles",
  },
  "right-triangle-trig": {
    prompt: "Try it: find the angle where sine and cosine are equal (45°).",
    isSolved: (state) => state.rightTriangleTrigResult !== null && Math.abs(state.rightTriangleTrigResult.angleDeg - 45) < 0.5,
  },
  "circle-measures": {
    prompt: "Try it: sweep the sector out to exactly a quarter of the circle (90°).",
    isSolved: (state) => state.circleMeasuresResult !== null && Math.abs(state.circleMeasuresResult.centralAngleDeg - 90) < 1,
  },
  "regular-polygon": {
    prompt: "Try it: dial in a regular hexagon — 6 sides.",
    isSolved: (state) => state.regularPolygonResult !== null && state.regularPolygonResult.sides === 6,
  },
  transformations: {
    prompt: "Try it: scale the triangle to exactly double size.",
    isSolved: (state) => state.transformationsResult !== null && Math.abs(state.transformationsResult.scale - 2) < 0.05,
  },
  "square-cube-law": {
    prompt: "Try it: shrink the sphere until its surface-to-volume ratio passes 10 — ant-scale efficiency.",
    isSolved: (state) => state.magnitudeResult !== null && state.magnitudeResult.ratio > 10,
  },
  "catenary-arch": {
    prompt: "Try it: slacken the rope until it sags more than 4 units.",
    isSolved: (state) => state.catenaryResult !== null && state.catenaryResult.sag > 4,
  },
  "allometric-growth": {
    prompt: "Try it: grow the part to more than 5× the size of the body — antler-scale disproportion.",
    isSolved: (state) => state.allometryResult !== null && state.allometryResult.ratio > 5,
  },
  phyllotaxis: {
    prompt: "Try it: dial the divergence angle to within half a degree of the true golden angle (137.5°).",
    isSolved: (state) => state.phyllotaxisResult !== null && state.phyllotaxisResult.deviationDeg < 0.5,
  },
  "logistic-growth": {
    prompt: "Try it: push the growth rate up until the fastest moment exceeds 3 units per unit time.",
    isSolved: (state) => state.logisticResult !== null && state.logisticResult.maxGrowthRate > 3,
  },
};
