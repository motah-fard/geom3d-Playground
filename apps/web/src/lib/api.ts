import type {
  ClosestPointAABBRequest,
  ClosestPointAABBResponse,
  ClosestPointSegmentRequest,
  ClosestPointSegmentResponse,
  IntersectRayAABBRequest,
  IntersectRayAABBResponse,
  IntersectRayPlaneRequest,
  IntersectRayPlaneResponse,
  ProjectPointToPlaneRequest,
  ProjectPointToPlaneResponse,
  SegmentSegmentRequest,
  SegmentSegmentResponse,
} from "@/types/geometry";

// Falls back to the local backend's default port so the app works out of
// the box without requiring a .env.local — see .env.local.example for how
// to point at a different backend.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

let activeController: AbortController | null = null;

export type ApiTrace = {
  path: string;
  request: unknown;
  response?: unknown;
  durationMs?: number;
  status: "running" | "success" | "error";
  error?: string;
};

let latestTrace: ApiTrace | null = null;
const traceListeners = new Set<() => void>();
const publishTrace = (trace: ApiTrace) => {
  latestTrace = trace;
  traceListeners.forEach((listener) => listener());
};

export const getLatestApiTrace = () => latestTrace;
export const subscribeApiTrace = (listener: () => void) => {
  traceListeners.add(listener);
  return () => { traceListeners.delete(listener); };
};

async function postQuery<TRequest, TResponse>(
  path: string,
  payload: TRequest
): Promise<TResponse> {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const started = performance.now();
  publishTrace({ path, request: payload, status: "running" });
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const maybeJson = await res.json().catch(() => null);
      throw new Error(maybeJson?.error ?? "Request failed");
    }

    const data = await res.json();
    if (activeController === controller) activeController = null;
    publishTrace({ path, request: payload, response: data, durationMs: performance.now() - started, status: "success" });
    return data as TResponse;
  } catch (error) {
    if (!isAbortedRequest(error)) {
      publishTrace({ path, request: payload, durationMs: performance.now() - started, status: "error", error: error instanceof Error ? error.message : "Request failed" });
    }
    throw error;
  }
}

export function isAbortedRequest(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function projectPointToPlane(input: ProjectPointToPlaneRequest) {
  return postQuery<ProjectPointToPlaneRequest, ProjectPointToPlaneResponse>(
    "/api/v1/queries/project-point-to-plane",
    input
  );
}

export function intersectRayPlane(input: IntersectRayPlaneRequest) {
  return postQuery<IntersectRayPlaneRequest, IntersectRayPlaneResponse>(
    "/api/v1/queries/intersect-ray-plane",
    input
  );
}

export function closestPointSegment(payload: ClosestPointSegmentRequest) {
  return postQuery<ClosestPointSegmentRequest, ClosestPointSegmentResponse>(
    "/api/v1/queries/closest-point-segment",
    payload
  );
}

export function segmentSegmentDistance(payload: SegmentSegmentRequest) {
  return postQuery<SegmentSegmentRequest, SegmentSegmentResponse>(
    "/api/v1/queries/segment-segment",
    payload
  );
}

export function intersectRayAABB(payload: IntersectRayAABBRequest) {
  return postQuery<IntersectRayAABBRequest, IntersectRayAABBResponse>(
    "/api/v1/queries/intersect-ray-aabb",
    payload
  );
}

export function closestPointAABB(payload: ClosestPointAABBRequest) {
  return postQuery<ClosestPointAABBRequest, ClosestPointAABBResponse>(
    "/api/v1/queries/closest-point-aabb",
    payload
  );
}
