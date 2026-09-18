package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// jsonEchoHandler mirrors the real pattern used throughout handlers.go:
// decode into a struct, write 400 on any failure (including a body that
// MaxBytesReader cut off), 200 with the decoded value otherwise.
func jsonEchoHandler(w http.ResponseWriter, r *http.Request) {
	var body map[string]string
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	writeJSON(w, http.StatusOK, body)
}

func TestLimitBodyAllowsWithinLimit(t *testing.T) {
	handler := limitBody(1024, jsonEchoHandler)

	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{"point":"1,2,3"}`))
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("got status %d, want 200, body: %s", rec.Code, rec.Body.String())
	}
}

func TestLimitBodyRejectsOverLimit(t *testing.T) {
	handler := limitBody(10, jsonEchoHandler)

	// Well-formed JSON, but far larger than the 10-byte limit — this is
	// the real shape of the attack limitBody exists to stop: a client
	// sending more data than a tiny query struct could ever need.
	oversized := `{"point":"` + strings.Repeat("x", 1000) + `"}`
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(oversized))
	rec := httptest.NewRecorder()
	handler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("got status %d, want 400 (decode should fail once MaxBytesReader cuts the body off)", rec.Code)
	}
}
