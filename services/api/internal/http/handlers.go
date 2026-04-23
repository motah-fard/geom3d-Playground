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
