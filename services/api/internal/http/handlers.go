package http

import (
	"encoding/json"
	"net/http"

	"github.com/motah-fard/geom3d"
	"github.com/motah-fard/geom3d-playground-api/internal/domain"
	"github.com/motah-fard/geom3d-playground-api/internal/service"
)

type Handler struct {
	queries *service.QueryService
}

func NewHandler(queries *service.QueryService) *Handler {
	return &Handler{queries: queries}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status": "ok",
	})
}

func (h *Handler) ProjectPointToPlane(w http.ResponseWriter, r *http.Request) {
	var req domain.ProjectPointToPlaneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	resp, err := h.queries.ProjectPointToPlane(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}
func (h *Handler) ClosestPointSegment(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Point struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"point"`
		Segment struct {
			A struct {
				X float64 `json:"x"`
				Y float64 `json:"y"`
				Z float64 `json:"z"`
			} `json:"a"`
			B struct {
				X float64 `json:"x"`
				Y float64 `json:"y"`
				Z float64 `json:"z"`
			} `json:"b"`
		} `json:"segment"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	point := geom3d.Vec3{X: req.Point.X, Y: req.Point.Y, Z: req.Point.Z}
	a := geom3d.Vec3{X: req.Segment.A.X, Y: req.Segment.A.Y, Z: req.Segment.A.Z}
	b := geom3d.Vec3{X: req.Segment.B.X, Y: req.Segment.B.Y, Z: req.Segment.B.Z}

	closest, dist := h.queries.ClosestPointSegment(point, a, b)

	resp := map[string]interface{}{
		"point": map[string]float64{
			"x": closest.X,
			"y": closest.Y,
			"z": closest.Z,
		},
		"distance": dist,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{
		"error": message,
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func (h *Handler) IntersectRayPlane(w http.ResponseWriter, r *http.Request) {
	var req domain.IntersectRayPlaneRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	resp, err := h.queries.IntersectRayPlane(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}
func (h *Handler) SegmentSegmentDistance(w http.ResponseWriter, r *http.Request) {
	type request struct {
		A1 struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"a1"`
		A2 struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"a2"`
		B1 struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"b1"`
		B2 struct {
			X float64 `json:"x"`
			Y float64 `json:"y"`
			Z float64 `json:"z"`
		} `json:"b2"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	a1 := geom3d.Vec3{X: req.A1.X, Y: req.A1.Y, Z: req.A1.Z}
	a2 := geom3d.Vec3{X: req.A2.X, Y: req.A2.Y, Z: req.A2.Z}
	b1 := geom3d.Vec3{X: req.B1.X, Y: req.B1.Y, Z: req.B1.Z}
	b2 := geom3d.Vec3{X: req.B2.X, Y: req.B2.Y, Z: req.B2.Z}

	pA, pB := geom3d.ClosestPointsBetweenSegments(
		geom3d.Segment3{A: a1, B: a2},
		geom3d.Segment3{A: b1, B: b2},
	)

	dist := pA.Sub(pB).Norm()

	resp := map[string]interface{}{
		"pointA": map[string]float64{
			"x": pA.X,
			"y": pA.Y,
			"z": pA.Z,
		},
		"pointB": map[string]float64{
			"x": pB.X,
			"y": pB.Y,
			"z": pB.Z,
		},
		"distance": dist,
	}

	writeJSON(w, http.StatusOK, resp)
}
