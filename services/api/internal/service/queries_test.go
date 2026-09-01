package service

import (
	"testing"

	"github.com/motah-fard/geom3d-playground-api/internal/domain"
)

func TestProjectPointToPlane(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.ProjectPointToPlane(domain.ProjectPointToPlaneRequest{
		Point: domain.Vec3DTO{X: 1, Y: 2, Z: 3},
		Plane: domain.PlaneDTO{
			Point:  domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Normal: domain.Vec3DTO{X: 0, Y: 0, Z: 1},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Point.X != 1 || resp.Point.Y != 2 || resp.Point.Z != 0 {
		t.Fatalf("unexpected projected point: %#v", resp.Point)
	}

	if resp.Distance != 3 {
		t.Fatalf("unexpected distance: got %v want 3", resp.Distance)
	}
}

func TestProjectPointToPlaneInvalidPlane(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.ProjectPointToPlane(domain.ProjectPointToPlaneRequest{
		Point: domain.Vec3DTO{X: 1, Y: 2, Z: 3},
		Plane: domain.PlaneDTO{
			Point:  domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Normal: domain.Vec3DTO{},
		},
	})
	if err == nil {
		t.Fatal("expected error for invalid plane")
	}
}

func TestIntersectRayPlaneValidHit(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.IntersectRayPlane(domain.IntersectRayPlaneRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: 0, Y: 0, Z: 5},
			Dir:    domain.Vec3DTO{X: 0, Y: 0, Z: -1},
		},
		Plane: domain.PlaneDTO{
			Point:  domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Normal: domain.Vec3DTO{X: 0, Y: 0, Z: 1},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !resp.Hit {
		t.Fatal("expected ray to hit plane")
	}

	if resp.Point.X != 0 || resp.Point.Y != 0 || resp.Point.Z != 0 {
		t.Fatalf("unexpected hit point: %#v", resp.Point)
	}
}

func TestIntersectRayPlaneInvalidRay(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.IntersectRayPlane(domain.IntersectRayPlaneRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: 0, Y: 0, Z: 5},
			Dir:    domain.Vec3DTO{},
		},
		Plane: domain.PlaneDTO{
			Point:  domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Normal: domain.Vec3DTO{X: 0, Y: 0, Z: 1},
		},
	})
	if err == nil {
		t.Fatal("expected error for invalid ray")
	}
}

func TestIntersectRayPlaneParallelNoHit(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.IntersectRayPlane(domain.IntersectRayPlaneRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: 0, Y: 0, Z: 5},
			Dir:    domain.Vec3DTO{X: 1, Y: 0, Z: 0},
		},
		Plane: domain.PlaneDTO{
			Point:  domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Normal: domain.Vec3DTO{X: 0, Y: 0, Z: 1},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Hit {
		t.Fatalf("expected no hit, got %#v", resp)
	}
}

func TestIntersectRayPlaneParameterAtPointDominantAxis(t *testing.T) {
	// A ray whose direction has a much larger Y component than X: t must
	// come out correctly regardless of which axis rayParameterAtPoint
	// picks, but this specifically exercises the "not just the first
	// non-zero axis" dominant-axis logic.
	svc := NewQueryService()

	resp, err := svc.IntersectRayPlane(domain.IntersectRayPlaneRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Dir:    domain.Vec3DTO{X: 0.001, Y: 1, Z: 0},
		},
		Plane: domain.PlaneDTO{
			Point:  domain.Vec3DTO{X: 0, Y: 5, Z: 0},
			Normal: domain.Vec3DTO{X: 0, Y: 1, Z: 0},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !resp.Hit {
		t.Fatal("expected ray to hit plane")
	}
	if got, want := resp.T, 5.0; got < want-1e-6 || got > want+1e-6 {
		t.Fatalf("unexpected t: got %v want %v", got, want)
	}
}

func TestClosestPointSegment(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.ClosestPointSegment(domain.ClosestPointSegmentRequest{
		Point: domain.Vec3DTO{X: 1, Y: 1, Z: 0},
		Segment: domain.SegmentDTO{
			A: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			B: domain.Vec3DTO{X: 2, Y: 0, Z: 0},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Point.X != 1 || resp.Point.Y != 0 || resp.Point.Z != 0 {
		t.Fatalf("unexpected closest point: %#v", resp.Point)
	}
	if resp.Distance != 1 {
		t.Fatalf("unexpected distance: got %v want 1", resp.Distance)
	}
}

func TestClosestPointSegmentDegenerate(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.ClosestPointSegment(domain.ClosestPointSegmentRequest{
		Point: domain.Vec3DTO{X: 1, Y: 1, Z: 0},
		Segment: domain.SegmentDTO{
			A: domain.Vec3DTO{X: 5, Y: 5, Z: 5},
			B: domain.Vec3DTO{X: 5, Y: 5, Z: 5},
		},
	})
	if err == nil {
		t.Fatal("expected error for degenerate segment")
	}
}

func TestSegmentSegmentDistance(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.SegmentSegmentDistance(domain.SegmentSegmentRequest{
		A1: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
		A2: domain.Vec3DTO{X: 2, Y: 0, Z: 0},
		B1: domain.Vec3DTO{X: 0, Y: 1, Z: 0},
		B2: domain.Vec3DTO{X: 2, Y: 1, Z: 0},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Distance != 1 {
		t.Fatalf("unexpected distance: got %v want 1", resp.Distance)
	}
}

func TestSegmentSegmentDistanceDegenerate(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.SegmentSegmentDistance(domain.SegmentSegmentRequest{
		A1: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
		A2: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
		B1: domain.Vec3DTO{X: 0, Y: 1, Z: 0},
		B2: domain.Vec3DTO{X: 2, Y: 1, Z: 0},
	})
	if err == nil {
		t.Fatal("expected error for degenerate segment A")
	}
}

func TestIntersectRayAABBHit(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.IntersectRayAABB(domain.IntersectRayAABBRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: -1, Y: 0.5, Z: 0.5},
			Dir:    domain.Vec3DTO{X: 1, Y: 0, Z: 0},
		},
		AABB: domain.AABBDTO{
			Min: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Max: domain.Vec3DTO{X: 1, Y: 1, Z: 1},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !resp.Hit {
		t.Fatal("expected ray to hit AABB")
	}
	if resp.TMin != 1 || resp.TMax != 2 {
		t.Fatalf("unexpected tMin/tMax: got %v/%v want 1/2", resp.TMin, resp.TMax)
	}
	if resp.Point.X != 0 || resp.Point.Y != 0.5 || resp.Point.Z != 0.5 {
		t.Fatalf("unexpected hit point: %#v", resp.Point)
	}
}

func TestIntersectRayAABBMiss(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.IntersectRayAABB(domain.IntersectRayAABBRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: -1, Y: 5, Z: 0.5},
			Dir:    domain.Vec3DTO{X: 1, Y: 0, Z: 0},
		},
		AABB: domain.AABBDTO{
			Min: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Max: domain.Vec3DTO{X: 1, Y: 1, Z: 1},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Hit {
		t.Fatalf("expected no hit, got %#v", resp)
	}
}

func TestIntersectRayAABBInvalidBox(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.IntersectRayAABB(domain.IntersectRayAABBRequest{
		Ray: domain.RayDTO{
			Origin: domain.Vec3DTO{X: -1, Y: 0.5, Z: 0.5},
			Dir:    domain.Vec3DTO{X: 1, Y: 0, Z: 0},
		},
		AABB: domain.AABBDTO{
			Min: domain.Vec3DTO{X: 1, Y: 1, Z: 1},
			Max: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
		},
	})
	if err == nil {
		t.Fatal("expected error for invalid AABB")
	}
}

func TestClosestPointAABBOutside(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.ClosestPointAABB(domain.ClosestPointAABBRequest{
		Point: domain.Vec3DTO{X: 3, Y: -1, Z: 1},
		AABB: domain.AABBDTO{
			Min: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
			Max: domain.Vec3DTO{X: 2, Y: 2, Z: 2},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Point.X != 2 || resp.Point.Y != 0 || resp.Point.Z != 1 {
		t.Fatalf("unexpected closest point: %#v", resp.Point)
	}
}

func TestClosestPointAABBInvalidBox(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.ClosestPointAABB(domain.ClosestPointAABBRequest{
		Point: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
		AABB: domain.AABBDTO{
			Min: domain.Vec3DTO{X: 1, Y: 1, Z: 1},
			Max: domain.Vec3DTO{X: 0, Y: 0, Z: 0},
		},
	})
	if err == nil {
		t.Fatal("expected error for invalid AABB")
	}
}
