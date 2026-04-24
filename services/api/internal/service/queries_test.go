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
