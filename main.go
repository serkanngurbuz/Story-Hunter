package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type Response struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := Response{
		OK:      true,
		Message: "Story Hunter backend çalışıyor.",
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/health", healthHandler)

	fmt.Println("Story Hunter backend starting on port", port)

	log.Fatal(
		http.ListenAndServe(
			":"+port,
			nil,
		),
	)
}
