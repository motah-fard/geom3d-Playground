package service

import (
	"errors"
	"fmt"
	"math"
	"runtime"
	"sync"
	"time"

	"github.com/motah-fard/geom3d"
	"github.com/motah-fard/geom3d-playground-api/internal/domain"
)

// maxBatchSegments bounds BatchClosestPointSegments's request size. It's
// generous enough to make the sequential/parallel timing gap visible on a
// live demo, while keeping the JSON payload (browser -> API) and the
// worst-case memory for a single request bounded.
const maxBatchSegments = 20_000

type QueryService struct{}

func NewQueryService() *QueryService {
	return &QueryService{}
}

func toVec3(v domain.Vec3DTO) geom3d.Vec3 {
	return geom3d.Vec3{X: v.X, Y: v.Y, Z: v.Z}
}

func fromVec3(v geom3d.Vec3) domain.Vec3DTO {
	return domain.Vec3DTO{X: v.X, Y: v.Y, Z: v.Z}
}

func (s *QueryService) ProjectPointToPlane(
	req domain.ProjectPointToPlaneRequest,
) (domain.ProjectPointToPlaneResponse, error) {
	plane := geom3d.Plane{
		Point:  toVec3(req.Plane.Point),
		Normal: toVec3(req.Plane.Normal),
	}

	if !plane.IsValid() {
		return domain.ProjectPointToPlaneResponse{}, errors.New("plane normal must be non-zero")
	}

	point := toVec3(req.Point)

	projected := geom3d.ProjectPointToPlane(point, plane)
	distance := point.Distance(projected)

	return domain.ProjectPointToPlaneResponse{
		Point:    fromVec3(projected),
		Distance: distance,
	}, nil
}

func (s *QueryService) IntersectRayPlane(
	req domain.IntersectRayPlaneRequest,
) (domain.IntersectRayPlaneResponse, error) {
	ray := geom3d.Ray3{
		Origin: toVec3(req.Ray.Origin),
		Dir:    toVec3(req.Ray.Dir),
	}

	plane := geom3d.Plane{
		Point:  toVec3(req.Plane.Point),
		Normal: toVec3(req.Plane.Normal),
	}

	if !ray.IsValid() {
		return domain.IntersectRayPlaneResponse{}, errors.New("ray direction must be non-zero")
	}

	if !plane.IsValid() {
		return domain.IntersectRayPlaneResponse{}, errors.New("plane normal must be non-zero")
	}

	hitPoint, hit := geom3d.IntersectRayPlane(ray, plane)

	t := 0.0
	if hit {
		t = rayParameterAtPoint(ray, hitPoint)
	}

	return domain.IntersectRayPlaneResponse{
		Hit:   hit,
		Point: fromVec3(hitPoint),
		T:     t,
	}, nil
}

// rayParameterAtPoint recovers t such that r.PointAt(t) == p, given p is
// already known to lie on the ray. It divides using whichever axis of
// r.Dir has the largest magnitude, since dividing by a small component is
// numerically unstable even when that component is technically non-zero.
func rayParameterAtPoint(r geom3d.Ray3, p geom3d.Vec3) float64 {
	ax, ay, az := math.Abs(r.Dir.X), math.Abs(r.Dir.Y), math.Abs(r.Dir.Z)

	switch {
	case ax >= ay && ax >= az:
		return (p.X - r.Origin.X) / r.Dir.X
	case ay >= az:
		return (p.Y - r.Origin.Y) / r.Dir.Y
	default:
		return (p.Z - r.Origin.Z) / r.Dir.Z
	}
}

func (s *QueryService) ClosestPointSegment(
	req domain.ClosestPointSegmentRequest,
) (domain.ClosestPointSegmentResponse, error) {
	seg := geom3d.Segment3{
		A: toVec3(req.Segment.A),
		B: toVec3(req.Segment.B),
	}

	if seg.IsDegenerate() {
		return domain.ClosestPointSegmentResponse{}, errors.New("segment endpoints must not coincide")
	}

	point := toVec3(req.Point)
	closest := geom3d.ClosestPointOnSegment(point, seg)
	distance := point.Distance(closest)

	return domain.ClosestPointSegmentResponse{
		Point:    fromVec3(closest),
		Distance: distance,
	}, nil
}

func (s *QueryService) SegmentSegmentDistance(
	req domain.SegmentSegmentRequest,
) (domain.SegmentSegmentResponse, error) {
	segA := geom3d.Segment3{A: toVec3(req.A1), B: toVec3(req.A2)}
	segB := geom3d.Segment3{A: toVec3(req.B1), B: toVec3(req.B2)}

	if segA.IsDegenerate() || segB.IsDegenerate() {
		return domain.SegmentSegmentResponse{}, errors.New("segment endpoints must not coincide")
	}

	pointA, pointB := geom3d.ClosestPointsBetweenSegments(segA, segB)
	distance := pointA.Distance(pointB)

	return domain.SegmentSegmentResponse{
		PointA:   fromVec3(pointA),
		PointB:   fromVec3(pointB),
		Distance: distance,
	}, nil
}

func toAABB(v domain.AABBDTO) geom3d.AABB {
	return geom3d.AABB{Min: toVec3(v.Min), Max: toVec3(v.Max)}
}

func (s *QueryService) IntersectRayAABB(
	req domain.IntersectRayAABBRequest,
) (domain.IntersectRayAABBResponse, error) {
	ray := geom3d.Ray3{
		Origin: toVec3(req.Ray.Origin),
		Dir:    toVec3(req.Ray.Dir),
	}
	box := toAABB(req.AABB)

	if !ray.IsValid() {
		return domain.IntersectRayAABBResponse{}, errors.New("ray direction must be non-zero")
	}
	if !box.IsValid() {
		return domain.IntersectRayAABBResponse{}, errors.New("aabb min must be less than or equal to max on every axis")
	}

	hit, tMin, tMax := geom3d.IntersectRayAABB(ray, box)

	var point geom3d.Vec3
	if hit {
		point = ray.PointAt(tMin)
	}

	return domain.IntersectRayAABBResponse{
		Hit:   hit,
		TMin:  tMin,
		TMax:  tMax,
		Point: fromVec3(point),
	}, nil
}

func (s *QueryService) ClosestPointAABB(
	req domain.ClosestPointAABBRequest,
) (domain.ClosestPointAABBResponse, error) {
	box := toAABB(req.AABB)

	if !box.IsValid() {
		return domain.ClosestPointAABBResponse{}, errors.New("aabb min must be less than or equal to max on every axis")
	}

	point := toVec3(req.Point)
	closest := geom3d.ClosestPointOnAABB(point, box)
	distance := point.Distance(closest)

	return domain.ClosestPointAABBResponse{
		Point:    fromVec3(closest),
		Distance: distance,
	}, nil
}

// closestSegmentResult is the winner from scanning a slice (or sub-slice) of
// segments: which one, and how far. index is -1 for an empty slice.
type closestSegmentResult struct {
	index    int
	distance float64
}

func closestSegmentSequential(point geom3d.Vec3, segments []geom3d.Segment3) closestSegmentResult {
	best := closestSegmentResult{index: -1, distance: math.Inf(1)}
	for i, seg := range segments {
		if d := geom3d.DistancePointToSegment(point, seg); d < best.distance {
			best = closestSegmentResult{index: i, distance: d}
		}
	}
	return best
}

// closestSegmentParallel does the same scan as closestSegmentSequential, but
// fanned out across GOMAXPROCS goroutines: each goroutine scans its own
// contiguous chunk and writes only to its own slot of partials (indexed by
// worker number), so no mutex is needed for the fan-out — only the final
// fan-in reduction over the small partials slice is sequential.
// closestSegmentParallel returns the winning result plus the worker count it
// actually used (which may be clamped below GOMAXPROCS for a small input) —
// the caller reports that count rather than recomputing the same clamp
// itself, so the two can't independently drift out of sync.
func closestSegmentParallel(point geom3d.Vec3, segments []geom3d.Segment3) (closestSegmentResult, int) {
	// GOMAXPROCS(0) (read-only: passing 0 doesn't change it) rather than
	// NumCPU() — NumCPU always reports the host's full core count, which is
	// wrong once this runs in a container with a CPU quota below the host's
	// core count (e.g. a small Fly.io machine on a bigger physical host).
	// GOMAXPROCS reflects what the process can actually schedule onto.
	numWorkers := runtime.GOMAXPROCS(0)
	if numWorkers > len(segments) {
		numWorkers = len(segments)
	}
	chunkSize := (len(segments) + numWorkers - 1) / numWorkers

	partials := make([]closestSegmentResult, numWorkers)
	var wg sync.WaitGroup
	for w := 0; w < numWorkers; w++ {
		start := w * chunkSize
		if start >= len(segments) {
			// chunkSize is rounded up, so when len(segments) doesn't divide
			// evenly by numWorkers, the last worker(s) can start past the
			// end of the slice — they simply have no work.
			partials[w] = closestSegmentResult{index: -1, distance: math.Inf(1)}
			continue
		}
		end := min(start+chunkSize, len(segments))

		wg.Add(1)
		go func(worker, start, end int) {
			defer wg.Done()
			partials[worker] = closestSegmentSequential(point, segments[start:end])
			if partials[worker].index >= 0 {
				partials[worker].index += start
			}
		}(w, start, end)
	}
	wg.Wait()

	best := closestSegmentResult{index: -1, distance: math.Inf(1)}
	for _, p := range partials {
		if p.distance < best.distance {
			best = p
		}
	}
	return best, numWorkers
}

// BatchClosestPointSegments finds the single closest segment to Point among
// potentially thousands, computing the same result both sequentially and
// fanned out across goroutines (closestSegmentParallel) so the two can be
// timed head-to-head on identical input in one request. It exists to make
// Go's concurrency model tangible in the playground, on a workload that's
// actually large enough for it to matter — unlike this API's other queries,
// which are all O(1).
func (s *QueryService) BatchClosestPointSegments(
	req domain.BatchClosestPointSegmentsRequest,
) (domain.BatchClosestPointSegmentsResponse, error) {
	if len(req.Segments) == 0 {
		return domain.BatchClosestPointSegmentsResponse{}, errors.New("segments must not be empty")
	}
	if len(req.Segments) > maxBatchSegments {
		return domain.BatchClosestPointSegmentsResponse{}, fmt.Errorf("segments must not exceed %d", maxBatchSegments)
	}

	point := toVec3(req.Point)
	segments := make([]geom3d.Segment3, len(req.Segments))
	for i, dto := range req.Segments {
		seg := geom3d.Segment3{A: toVec3(dto.A), B: toVec3(dto.B)}
		if seg.IsDegenerate() {
			return domain.BatchClosestPointSegmentsResponse{}, fmt.Errorf("segment %d: endpoints must not coincide", i)
		}
		segments[i] = seg
	}

	seqStart := time.Now()
	closestSegmentSequential(point, segments)
	seqElapsed := time.Since(seqStart)

	parStart := time.Now()
	best, numWorkers := closestSegmentParallel(point, segments)
	parElapsed := time.Since(parStart)

	closest := geom3d.ClosestPointOnSegment(point, segments[best.index])

	return domain.BatchClosestPointSegmentsResponse{
		ClosestPoint:     fromVec3(closest),
		Distance:         best.distance,
		SegmentIndex:     best.index,
		NumSegments:      len(segments),
		NumWorkers:       numWorkers,
		SequentialMicros: float64(seqElapsed.Microseconds()),
		ParallelMicros:   float64(parElapsed.Microseconds()),
	}, nil
}
