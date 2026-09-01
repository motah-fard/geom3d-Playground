package service

import (
	"errors"
	"math"

	"github.com/motah-fard/geom3d"
	"github.com/motah-fard/geom3d-playground-api/internal/domain"
)

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
