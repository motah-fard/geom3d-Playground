import { create } from "zustand";
import type {
  IntersectRayPlaneResponse,
  ProjectPointToPlaneResponse,
  Vec3,
} from "@/types/geometry";

type QueryType = "project-point-to-plane" | "intersect-ray-plane";

type PlaygroundState = {
  queryType: QueryType;

  point: Vec3;
  planePoint: Vec3;
  planeNormal: Vec3;

  rayOrigin: Vec3;
  rayDir: Vec3;

  result: ProjectPointToPlaneResponse | null;
  rayPlaneResult: IntersectRayPlaneResponse | null;
  error: string | null;

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

  setResult: (result: ProjectPointToPlaneResponse | null) => void;
  setRayPlaneResult: (result: IntersectRayPlaneResponse | null) => void;
  setError: (error: string | null) => void;
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  queryType: "project-point-to-plane",

  point: { x: 1, y: 2, z: 3 },
  planePoint: { x: 0, y: 0, z: 0 },
  planeNormal: { x: 0, y: 0, z: 1 },

  rayOrigin: { x: 0, y: 0, z: 5 },
  rayDir: { x: 0, y: 0, z: -1 },

  result: null,
  rayPlaneResult: null,
  error: null,

  setQueryType: (queryType) =>
    set({
      queryType,
      error: null,
    }),

  setInputs: ({ point, planePoint, planeNormal }) =>
    set({ point, planePoint, planeNormal }),

  setRayInputs: ({ rayOrigin, rayDir, planePoint, planeNormal }) =>
    set({ rayOrigin, rayDir, planePoint, planeNormal }),

  setResult: (result) => set({ result }),
  setRayPlaneResult: (rayPlaneResult) => set({ rayPlaneResult }),
  setError: (error) => set({ error }),
}));