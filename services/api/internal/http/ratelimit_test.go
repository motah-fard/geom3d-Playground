package http

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRateLimiterAllowsBurstThenBlocks(t *testing.T) {
	rl := &rateLimiter{buckets: make(map[string]*tokenBucket), burst: 3, refillPerSec: 0}

	for i := 0; i < 3; i++ {
		if !rl.allow("client-a") {
			t.Fatalf("request %d: expected allowed within burst", i+1)
		}
	}
	if rl.allow("client-a") {
		t.Fatal("expected the 4th request to be blocked once the burst is exhausted")
	}
}

func TestRateLimiterRefillsOverTime(t *testing.T) {
	rl := &rateLimiter{buckets: make(map[string]*tokenBucket), burst: 1, refillPerSec: 20}

	if !rl.allow("client-b") {
		t.Fatal("expected the first request to be allowed")
	}
	if rl.allow("client-b") {
		t.Fatal("expected the second immediate request to be blocked")
	}

	time.Sleep(100 * time.Millisecond) // 20/s refill => ~2 tokens back, well over 1
	if !rl.allow("client-b") {
		t.Fatal("expected a request to be allowed again after the refill window")
	}
}

func TestRateLimiterTracksClientsIndependently(t *testing.T) {
	rl := &rateLimiter{buckets: make(map[string]*tokenBucket), burst: 1, refillPerSec: 0}

	if !rl.allow("client-c") {
		t.Fatal("expected client-c's first request to be allowed")
	}
	if !rl.allow("client-d") {
		t.Fatal("expected client-d's first request to be allowed independently of client-c's bucket")
	}
	if rl.allow("client-c") {
		t.Fatal("expected client-c's second request to still be blocked")
	}
}

func TestClientKeyStripsPort(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.RemoteAddr = "203.0.113.7:54321"
	if got := clientKey(req); got != "203.0.113.7" {
		t.Fatalf("clientKey: got %q, want %q", got, "203.0.113.7")
	}
}

func TestClientKeyFallsBackWithoutPort(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.RemoteAddr = "not-a-host-port"
	if got := clientKey(req); got != "not-a-host-port" {
		t.Fatalf("clientKey: got %q, want the raw RemoteAddr as a fallback", got)
	}
}

func TestRateLimitedMiddlewareReturns429AfterBurst(t *testing.T) {
	calls := 0
	inner := func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.WriteHeader(http.StatusOK)
	}
	handler := rateLimited(2, 0, inner)

	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.RemoteAddr = "198.51.100.1:1111"

	for i := 0; i < 2; i++ {
		rec := httptest.NewRecorder()
		handler(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("request %d: got status %d, want 200", i+1, rec.Code)
		}
	}

	rec := httptest.NewRecorder()
	handler(rec, req)
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("3rd request: got status %d, want 429", rec.Code)
	}
	if calls != 2 {
		t.Fatalf("inner handler called %d times, want exactly 2 (3rd should be blocked before reaching it)", calls)
	}
}
