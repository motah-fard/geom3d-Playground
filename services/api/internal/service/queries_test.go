package service

import (
	"math"
	"math/rand"
	"testing"

	"github.com/motah-fard/geom3d"
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

func TestBatchClosestPointSegmentsMatchesBruteForce(t *testing.T) {
	svc := NewQueryService()

	rng := rand.New(rand.NewSource(7))
	const n = 5000
	segments := make([]domain.SegmentDTO, n)
	for i := range segments {
		segments[i] = domain.SegmentDTO{
			A: domain.Vec3DTO{X: rng.Float64() * 100, Y: rng.Float64() * 100, Z: rng.Float64() * 100},
			B: domain.Vec3DTO{X: rng.Float64() * 100, Y: rng.Float64() * 100, Z: rng.Float64() * 100},
		}
	}
	point := domain.Vec3DTO{X: 50, Y: 50, Z: 50}

	resp, err := svc.BatchClosestPointSegments(domain.BatchClosestPointSegmentsRequest{
		Point:    point,
		Segments: segments,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Brute-force the same input directly against the geom3d library (not
	// the parallel fan-out under test) to verify the goroutine scan found
	// the actual global minimum, not just a plausible-looking one.
	wantIndex, wantDist := -1, math.Inf(1)
	p := toVec3(point)
	for i, dto := range segments {
		seg := geom3d.Segment3{A: toVec3(dto.A), B: toVec3(dto.B)}
		if d := geom3d.DistancePointToSegment(p, seg); d < wantDist {
			wantIndex, wantDist = i, d
		}
	}

	if resp.SegmentIndex != wantIndex {
		t.Fatalf("segment index: got %d want %d", resp.SegmentIndex, wantIndex)
	}
	if math.Abs(resp.Distance-wantDist) > 1e-9 {
		t.Fatalf("distance: got %v want %v", resp.Distance, wantDist)
	}
	if resp.NumSegments != n {
		t.Fatalf("numSegments: got %d want %d", resp.NumSegments, n)
	}
	if resp.NumWorkers < 1 {
		t.Fatalf("numWorkers: got %d, want >= 1", resp.NumWorkers)
	}
	if resp.SequentialMicros < 0 || resp.ParallelMicros < 0 {
		t.Fatalf("timings must be non-negative: sequential=%v parallel=%v", resp.SequentialMicros, resp.ParallelMicros)
	}
}

// TestBatchClosestPointSegmentsChunkBoundaries exercises segment counts that
// don't divide evenly across runtime.NumCPU() workers — the case that
// originally panicked with a slice-bounds error when the last worker's
// chunk start landed past the end of the slice.
func TestBatchClosestPointSegmentsChunkBoundaries(t *testing.T) {
	svc := NewQueryService()
	rng := rand.New(rand.NewSource(42))

	for n := 1; n <= 200; n++ {
		segments := make([]domain.SegmentDTO, n)
		for i := range segments {
			segments[i] = domain.SegmentDTO{
				A: domain.Vec3DTO{X: rng.Float64() * 10, Y: rng.Float64() * 10, Z: rng.Float64() * 10},
				B: domain.Vec3DTO{X: rng.Float64() * 10, Y: rng.Float64() * 10, Z: rng.Float64() * 10},
			}
		}

		resp, err := svc.BatchClosestPointSegments(domain.BatchClosestPointSegmentsRequest{
			Point:    domain.Vec3DTO{X: 5, Y: 5, Z: 5},
			Segments: segments,
		})
		if err != nil {
			t.Fatalf("n=%d: unexpected error: %v", n, err)
		}
		if resp.SegmentIndex < 0 || resp.SegmentIndex >= n {
			t.Fatalf("n=%d: segmentIndex %d out of range", n, resp.SegmentIndex)
		}
	}
}

func TestBatchClosestPointSegmentsEmpty(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.BatchClosestPointSegments(domain.BatchClosestPointSegmentsRequest{
		Point:    domain.Vec3DTO{},
		Segments: nil,
	})
	if err == nil {
		t.Fatal("expected error for empty segments")
	}
}

func TestBatchClosestPointSegmentsOverLimit(t *testing.T) {
	svc := NewQueryService()

	segments := make([]domain.SegmentDTO, maxBatchSegments+1)
	for i := range segments {
		segments[i] = domain.SegmentDTO{A: domain.Vec3DTO{X: float64(i)}, B: domain.Vec3DTO{X: float64(i) + 1}}
	}

	_, err := svc.BatchClosestPointSegments(domain.BatchClosestPointSegmentsRequest{
		Point:    domain.Vec3DTO{},
		Segments: segments,
	})
	if err == nil {
		t.Fatal("expected error when segments exceed the limit")
	}
}

func TestBatchClosestPointSegmentsDegenerateSegment(t *testing.T) {
	svc := NewQueryService()

	_, err := svc.BatchClosestPointSegments(domain.BatchClosestPointSegmentsRequest{
		Point: domain.Vec3DTO{},
		Segments: []domain.SegmentDTO{
			{A: domain.Vec3DTO{X: 1, Y: 1, Z: 1}, B: domain.Vec3DTO{X: 1, Y: 1, Z: 1}},
		},
	})
	if err == nil {
		t.Fatal("expected error for a degenerate segment (coincident endpoints)")
	}
}

func TestBatchClosestPointSegmentsSingleSegment(t *testing.T) {
	svc := NewQueryService()

	resp, err := svc.BatchClosestPointSegments(domain.BatchClosestPointSegmentsRequest{
		Point: domain.Vec3DTO{X: 0, Y: 5, Z: 0},
		Segments: []domain.SegmentDTO{
			{A: domain.Vec3DTO{X: 0, Y: 0, Z: 0}, B: domain.Vec3DTO{X: 10, Y: 0, Z: 0}},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.SegmentIndex != 0 {
		t.Fatalf("segmentIndex: got %d want 0", resp.SegmentIndex)
	}
	if math.Abs(resp.Distance-5) > 1e-9 {
		t.Fatalf("distance: got %v want 5", resp.Distance)
	}
}
