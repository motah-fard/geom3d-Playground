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
