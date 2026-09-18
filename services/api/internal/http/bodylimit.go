package http

import "net/http"

// maxSmallRequestBytes bounds every query endpoint except
// batch-closest-point-segments, which sets its own, larger limit directly
// (see maxBatchRequestBytes in handlers.go) since its payload legitimately
// scales with caller-supplied input. Every other request here is a handful
// of nested float64 fields — a few hundred bytes at most — so 8KB is
// generous headroom, not a tight fit, while still closing off a client
// sending an arbitrarily large body to a handler that doesn't need one.
const maxSmallRequestBytes = 8 << 10 // 8 KiB

// limitBody wraps a handler so its request body can never exceed maxBytes,
// returning a plain 413 (via MaxBytesReader's own error surfaced through
// the handler's existing json-decode-failure path) rather than reading an
// unbounded body into memory first.
func limitBody(maxBytes int64, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
		next(w, r)
	}
}
