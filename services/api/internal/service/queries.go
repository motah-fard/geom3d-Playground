package service

import (
	"errors"

	"github.com/motah-fard/geom3d"
	"github.com/motah-fard/geom3d-playground-api/internal/domain"
)

type QueryService struct{}

func NewQueryService() *QueryService {
	return &QueryService{}
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
		ProjectedPoint: fromVec3(projected),
		Distance:       distance,
	}, nil
}

func toVec3(v domain.Vec3DTO) geom3d.Vec3 {
	return geom3d.Vec3{X: v.X, Y: v.Y, Z: v.Z}
}

func fromVec3(v geom3d.Vec3) domain.Vec3DTO {
	return domain.Vec3DTO{X: v.X, Y: v.Y, Z: v.Z}
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
func rayParameterAtPoint(r geom3d.Ray3, p geom3d.Vec3) float64 {
	const eps = 1e-12

	if abs(r.Dir.X) > eps {
		return (p.X - r.Origin.X) / r.Dir.X
	}
	if abs(r.Dir.Y) > eps {
		return (p.Y - r.Origin.Y) / r.Dir.Y
	}
	return (p.Z - r.Origin.Z) / r.Dir.Z
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
func (s *QueryService) ClosestPointSegment(
	point geom3d.Vec3,
	a geom3d.Vec3,
	b geom3d.Vec3,
) (geom3d.Vec3, float64) {
	seg := geom3d.Segment3{
		A: a,
		B: b,
	}

	closest := geom3d.ClosestPointOnSegment(point, seg)
	dist := point.Sub(closest).Norm()

	return closest, dist
}
