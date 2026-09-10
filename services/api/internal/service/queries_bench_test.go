package service

import (
	"fmt"
	"math/rand"
	"testing"

	"github.com/motah-fard/geom3d"
)

// closestSegmentSink prevents the compiler from optimizing away the
// benchmarked calls, since their results are otherwise discarded.
var closestSegmentSink closestSegmentResult

func randomSegmentsForBench(n int) []geom3d.Segment3 {
	rng := rand.New(rand.NewSource(1))
	segments := make([]geom3d.Segment3, n)
	for i := range segments {
		segments[i] = geom3d.Segment3{
			A: geom3d.Vec3{X: rng.Float64() * 100, Y: rng.Float64() * 100, Z: rng.Float64() * 100},
			B: geom3d.Vec3{X: rng.Float64() * 100, Y: rng.Float64() * 100, Z: rng.Float64() * 100},
		}
	}
	return segments
}

// BenchmarkClosestSegmentSequential and BenchmarkClosestSegmentParallel give
// a reproducible, `go test -bench` version of what the "Concurrency demo"
// panel shows live over HTTP — run both together to see where the
// crossover actually falls on your own hardware:
//
//	go test -bench=BenchmarkClosestSegment -benchmem ./internal/service
func BenchmarkClosestSegmentSequential(b *testing.B) {
	point := geom3d.Vec3{X: 50, Y: 50, Z: 50}
	for _, n := range []int{100, 1_000, 5_000, 20_000} {
		segments := randomSegmentsForBench(n)
		b.Run(fmt.Sprintf("n=%d", n), func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				closestSegmentSink = closestSegmentSequential(point, segments)
			}
		})
	}
}

func BenchmarkClosestSegmentParallel(b *testing.B) {
	point := geom3d.Vec3{X: 50, Y: 50, Z: 50}
	for _, n := range []int{100, 1_000, 5_000, 20_000} {
		segments := randomSegmentsForBench(n)
		b.Run(fmt.Sprintf("n=%d", n), func(b *testing.B) {
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				closestSegmentSink, _ = closestSegmentParallel(point, segments)
			}
		})
	}
}
