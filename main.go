package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type Video struct {
	ID          string   `json:"id"`
	URL         string   `json:"url"`
	Author      string   `json:"author"`
	Caption     string   `json:"caption"`
	Views       int64    `json:"views"`
	Likes       int64    `json:"likes"`
	Comments    int64    `json:"comments"`
	Shares      int64    `json:"shares"`
	StoryScore  int      `json:"storyScore"`
	Reasons     []string `json:"reasons"`
}

type ScanResponse struct {
	OK      bool    `json:"ok"`
	Message string  `json:"message"`
	Results []Video `json:"results"`
}

var seen = map[string]bool{}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	json.NewEncoder(w).Encode(map[string]interface{}{
		"ok":      true,
		"message": "Story Hunter backend çalışıyor.",
	})
}

func scoreStory(caption string, views, likes, comments, shares int64) (int, []string) {
	text := strings.ToLower(caption)

	score := 0
	reasons := []string{}

	positive := map[string]int{
		"unexpected":       18,
		"what happened":    16,
		"nobody expected":  18,
		"caught on camera": 15,
		"found":            12,
		"discovered":       12,
		"rescued":          14,
		"rescue":           14,
		"saved":            12,
		"accident":         12,
		"strange":          10,
		"crazy":            8,
		"shocking":         10,
		"shocked":          10,
		"reaction":         9,
		"then":             5,
		"finally":          5,
		"inside":           8,
		"hidden":           8,
		"secret":           8,
	}

	negative := map[string]int{
		"makeup":       35,
		"beauty":       30,
		"skincare":     30,
		"gym":          30,
		"fitness":      30,
		"workout":      30,
		"dance":        30,
		"lip sync":     35,
		"podcast":      25,
		"interview":    20,
		"outfit":       25,
		"fashion":      25,
		"motivation":   25,
		"giveaway":     25,
		"advertisement": 40,
		"crypto":       30,
		"forex":        30,
	}

	for word, points := range positive {
		if strings.Contains(text, word) {
			score += points
			reasons = append(reasons, word)
		}
	}

	for word, points := range negative {
		if strings.Contains(text, word) {
			score -= points
		}
	}

	if views >= 1000000 {
		score += 15
		reasons = append(reasons, "high views")
	} else if views >= 100000 {
		score += 8
		reasons = append(reasons, "good views")
	}

	if likes >= 100000 {
		score += 12
		reasons = append(reasons, "high engagement")
	} else if likes >= 10000 {
		score += 6
	}

	if comments >= 10000 {
		score += 8
		reasons = append(reasons, "strong discussion")
	}

	if shares >= 10000 {
		score += 10
		reasons = append(reasons, "high shares")
	}

	if score < 0 {
		score = 0
	}

	if score > 100 {
		score = 100
	}

	return score, reasons
}

func scanHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	// Şimdilik gerçek scraper bağlanmadan motorun çalıştığını test ediyoruz.
	// TikTok scraper bir sonraki aşamada buraya bağlanacak.

	now := time.Now().Unix()

	candidates := []Video{
		{
			ID:       fmt.Sprintf("test-%d", now),
			URL:      "https://www.tiktok.com/",
			Author:   "storyhunter_test",
			Caption:  "Nobody expected what happened next. A strange discovery was caught on camera.",
			Views:    1800000,
			Likes:    230000,
			Comments: 12000,
			Shares:   18000,
		},
	}

	results := []Video{}

	for _, video := range candidates {

		if seen[video.ID] {
			continue
		}

		video.StoryScore, video.Reasons =
			scoreStory(
				video.Caption,
				video.Views,
				video.Likes,
				video.Comments,
				video.Shares,
			)

		seen[video.ID] = true

		results = append(results, video)
	}

	json.NewEncoder(w).Encode(
		ScanResponse{
			OK:      true,
			Message: "Story Hunter tarama motoru çalışıyor.",
			Results: results,
		},
	)
}

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/scan", scanHandler)

	fmt.Println("Story Hunter backend starting on port", port)

	err := http.ListenAndServe(":"+port, nil)

	if err != nil {
		fmt.Println("Server error:", err)
	}
}