package http

import (
	"net/http"

	"github.com/motah-fard/geom3d-playground-api/internal/service"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	queryService := service.NewQueryService()
	handler := NewHandler(queryService)

	// Health
	mux.HandleFunc("GET /api/v1/health", handler.Health)

	// Queries
	mux.HandleFunc("POST /api/v1/queries/project-point-to-plane", handler.ProjectPointToPlane)
	mux.HandleFunc("POST /api/v1/queries/intersect-ray-plane", handler.IntersectRayPlane)
	mux.HandleFunc("POST /api/v1/queries/closest-point-segment", handler.ClosestPointSegment)

	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
