package main

import (
	"log"
	"net/http"
	"os"
	"time"

	httpapi "github.com/motah-fard/geom3d-playground-api/internal/http"
)

func main() {
	router := httpapi.NewRouter()

	addr := os.Getenv("PORT")
	if addr == "" {
		addr = "8081"
	}

	serverAddr := ":" + addr
	log.Printf("geom3d playground api listening on %s", serverAddr)

	// http.ListenAndServe's zero-value server has no timeouts at all — a
	// client that opens a connection and trickles bytes (or never sends a
	// full request) can hold a goroutine open indefinitely. These bound
	// every phase of a request generously enough for the slowest real case
	// (an 8MB batch-closest-point-segments upload on a slow connection)
	// while closing that door.
	server := &http.Server{
		Addr:              serverAddr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
