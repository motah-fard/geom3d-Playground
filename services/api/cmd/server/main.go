package main

import (
	"log"
	"net/http"
	"os"

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

	if err := http.ListenAndServe(serverAddr, router); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
