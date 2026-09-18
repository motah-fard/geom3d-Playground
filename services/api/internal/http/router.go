package http

import (
	"net/http"
	"os"

	"github.com/motah-fard/geom3d-playground-api/internal/service"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	queryService := service.NewQueryService()
	handler := NewHandler(queryService)

	// Health
	mux.HandleFunc("GET /api/v1/health", handler.Health)

	// Queries — each capped at maxSmallRequestBytes; none of these take
	// anything larger than a handful of nested floats.
	mux.HandleFunc("POST /api/v1/queries/project-point-to-plane", limitBody(maxSmallRequestBytes, handler.ProjectPointToPlane))
	mux.HandleFunc("POST /api/v1/queries/intersect-ray-plane", limitBody(maxSmallRequestBytes, handler.IntersectRayPlane))
	mux.HandleFunc("POST /api/v1/queries/closest-point-segment", limitBody(maxSmallRequestBytes, handler.ClosestPointSegment))
	mux.HandleFunc("POST /api/v1/queries/segment-segment", limitBody(maxSmallRequestBytes, handler.SegmentSegmentDistance))
	mux.HandleFunc("POST /api/v1/queries/intersect-ray-aabb", limitBody(maxSmallRequestBytes, handler.IntersectRayAABB))
	mux.HandleFunc("POST /api/v1/queries/closest-point-aabb", limitBody(maxSmallRequestBytes, handler.ClosestPointAABB))
	// Burst of 5, refilling at 1 every 3s (~20/min sustained) per client IP
	// — generous enough for someone clicking through the segment-count
	// presets in the "Concurrency demo" panel, restrictive enough to stop
	// a script hammering the one endpoint here that does real CPU work.
	mux.HandleFunc("POST /api/v1/queries/batch-closest-point-segments", rateLimited(5, 1.0/3.0, handler.BatchClosestPointSegments))

	return withCORS(mux)
}

func withCORS(next http.Handler) http.Handler {
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
