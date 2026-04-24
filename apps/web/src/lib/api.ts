import type {
  ProjectPointToPlaneRequest,
  ProjectPointToPlaneResponse,
  Vec3,
} from "@/types/geometry";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function projectPointToPlane(
  input: ProjectPointToPlaneRequest
): Promise<ProjectPointToPlaneResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/queries/project-point-to-plane`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!res.ok) {
    const maybeJson = await res.json().catch(() => null);
    throw new Error(maybeJson?.error ?? "Request failed");
  }

  return res.json();
}
import type {
  IntersectRayPlaneRequest,
  IntersectRayPlaneResponse,
} from "@/types/geometry";

export async function intersectRayPlane(
  input: IntersectRayPlaneRequest
): Promise<IntersectRayPlaneResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/queries/intersect-ray-plane`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!res.ok) {
    const maybeJson = await res.json().catch(() => null);
    throw new Error(maybeJson?.error ?? "Request failed");
  }

  return res.json();
}

type ClosestPointSegmentRequest = {
  point: Vec3;
  segment: {
    a: Vec3;
    b: Vec3;
  };
};

type ClosestPointSegmentResponse = {
  point: Vec3;
  distance: number;
};

export async function closestPointSegment(
  payload: ClosestPointSegmentRequest
): Promise<ClosestPointSegmentResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/queries/closest-point-segment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const maybeJson = await res.json().catch(() => null);
    throw new Error(maybeJson?.error ?? "Request failed");
  }

  return res.json();
}