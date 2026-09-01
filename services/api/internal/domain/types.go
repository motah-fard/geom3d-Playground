package domain

type Vec3DTO struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

type PlaneDTO struct {
	Point  Vec3DTO `json:"point"`
	Normal Vec3DTO `json:"normal"`
}

type ProjectPointToPlaneRequest struct {
	Point Vec3DTO  `json:"point"`
	Plane PlaneDTO `json:"plane"`
}

type ProjectPointToPlaneResponse struct {
	Point    Vec3DTO `json:"projectedPoint"`
	Distance float64 `json:"distance"`
}
type RayDTO struct {
	Origin Vec3DTO `json:"origin"`
	Dir    Vec3DTO `json:"dir"`
}

type IntersectRayPlaneRequest struct {
	Ray   RayDTO   `json:"ray"`
	Plane PlaneDTO `json:"plane"`
}

type IntersectRayPlaneResponse struct {
	Hit   bool    `json:"hit"`
	Point Vec3DTO `json:"point"`
	T     float64 `json:"t"`
}

type SegmentDTO struct {
	A Vec3DTO `json:"a"`
	B Vec3DTO `json:"b"`
}

type ClosestPointSegmentRequest struct {
	Point   Vec3DTO    `json:"point"`
	Segment SegmentDTO `json:"segment"`
}

type ClosestPointSegmentResponse struct {
	Point    Vec3DTO `json:"point"`
	Distance float64 `json:"distance"`
}

type SegmentSegmentRequest struct {
	A1 Vec3DTO `json:"a1"`
	A2 Vec3DTO `json:"a2"`
	B1 Vec3DTO `json:"b1"`
	B2 Vec3DTO `json:"b2"`
}

type SegmentSegmentResponse struct {
	PointA   Vec3DTO `json:"pointA"`
	PointB   Vec3DTO `json:"pointB"`
	Distance float64 `json:"distance"`
}

type AABBDTO struct {
	Min Vec3DTO `json:"min"`
	Max Vec3DTO `json:"max"`
}

type IntersectRayAABBRequest struct {
	Ray  RayDTO  `json:"ray"`
	AABB AABBDTO `json:"aabb"`
}

type IntersectRayAABBResponse struct {
	Hit   bool    `json:"hit"`
	TMin  float64 `json:"tMin"`
	TMax  float64 `json:"tMax"`
	Point Vec3DTO `json:"point"`
}

type ClosestPointAABBRequest struct {
	Point Vec3DTO `json:"point"`
	AABB  AABBDTO `json:"aabb"`
}

type ClosestPointAABBResponse struct {
	Point    Vec3DTO `json:"point"`
	Distance float64 `json:"distance"`
}
