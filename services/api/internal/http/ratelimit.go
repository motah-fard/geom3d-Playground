package http

import (
	"net"
	"net/http"
	"sync"
	"time"
)

// rateLimiter is a simple per-client token bucket. It exists only for
// BatchClosestPointSegments — the only endpoint in this API that does
// real, caller-sized CPU work (up to maxBatchSegments) rather than O(1)
// math, and so the only one worth throttling.
type rateLimiter struct {
	mu           sync.Mutex
	buckets      map[string]*tokenBucket
	burst        float64
	refillPerSec float64
}

type tokenBucket struct {
	tokens     float64
	lastAccess time.Time
}

func newRateLimiter(burst, refillPerSec float64) *rateLimiter {
	rl := &rateLimiter{
		buckets:      make(map[string]*tokenBucket),
		burst:        burst,
		refillPerSec: refillPerSec,
	}
	go rl.sweepStaleBuckets()
	return rl
}

// sweepStaleBuckets keeps the map from growing unboundedly over the
// server's lifetime as distinct client IPs come and go.
func (rl *rateLimiter) sweepStaleBuckets() {
	for range time.Tick(10 * time.Minute) {
		cutoff := time.Now().Add(-10 * time.Minute)
		rl.mu.Lock()
		for key, b := range rl.buckets {
			if b.lastAccess.Before(cutoff) {
				delete(rl.buckets, key)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, ok := rl.buckets[key]
	if !ok {
		rl.buckets[key] = &tokenBucket{tokens: rl.burst - 1, lastAccess: now}
		return true
	}

	elapsed := now.Sub(b.lastAccess).Seconds()
	b.tokens = min(rl.burst, b.tokens+elapsed*rl.refillPerSec)
	b.lastAccess = now

	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}

// clientKey extracts the request's client IP, stripping the port. Falls
// back to the raw RemoteAddr if it isn't in host:port form.
func clientKey(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// rateLimited wraps a handler so that a burst of `burst` requests, refilling
// at `refillPerSec` tokens/second per client IP, are allowed before further
// requests get a 429 until the bucket refills.
func rateLimited(burst, refillPerSec float64, next http.HandlerFunc) http.HandlerFunc {
	limiter := newRateLimiter(burst, refillPerSec)
	return func(w http.ResponseWriter, r *http.Request) {
		if !limiter.allow(clientKey(r)) {
			writeError(w, http.StatusTooManyRequests, "rate limit exceeded, please slow down")
			return
		}
		next(w, r)
	}
}
