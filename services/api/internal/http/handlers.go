package http

import (
	"encoding/json"
	"net/http"

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

func (h *Handler) ClosestPointSegment(w http.ResponseWriter, r *http.Request) {
	var req domain.ClosestPointSegmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	resp, err := h.queries.ClosestPointSegment(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) SegmentSegmentDistance(w http.ResponseWriter, r *http.Request) {
	var req domain.SegmentSegmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	resp, err := h.queries.SegmentSegmentDistance(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) IntersectRayAABB(w http.ResponseWriter, r *http.Request) {
	var req domain.IntersectRayAABBRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	resp, err := h.queries.IntersectRayAABB(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) ClosestPointAABB(w http.ResponseWriter, r *http.Request) {
	var req domain.ClosestPointAABBRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	resp, err := h.queries.ClosestPointAABB(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// maxBatchRequestBytes bounds the request body for BatchClosestPointSegments
// specifically — it's the only endpoint whose payload size scales with
// caller-supplied input (an array of segments) rather than a handful of
// fixed fields, so it's the only one that needs a body-size guard against a
// request built to exhaust memory before the segment-count check ever runs.
const maxBatchRequestBytes = 8 << 20 // 8 MiB

func (h *Handler) BatchClosestPointSegments(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxBatchRequestBytes)

	var req domain.BatchClosestPointSegmentsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body, or body exceeds size limit")
		return
	}

	resp, err := h.queries.BatchClosestPointSegments(req)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resp)
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
