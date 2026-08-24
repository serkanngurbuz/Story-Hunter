package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Video struct {
	ID         string   `json:"id"`
	URL        string   `json:"url"`
	Author     string   `json:"author"`
	Caption    string   `json:"caption"`
	Views      int64    `json:"views"`
	Likes      int64    `json:"likes"`
	Comments   int64    `json:"comments"`
	Shares     int64    `json:"shares"`
	StoryScore int      `json:"storyScore"`
	Reasons    []string `json:"reasons"`
}

type ScanResponse struct {
	OK       bool     `json:"ok"`
	Message  string   `json:"message"`
	Results  []Video  `json:"results"`
	Source   string   `json:"source"`
	Duration string   `json:"duration"`
}

var (
	seen   = make(map[string]bool)
	seenMu sync.Mutex
)

func number(v interface{}) int64 {
	switch x := v.(type) {
	case float64:
		return int64(x)
	case int64:
		return x
	case int:
		return int64(x)
	case string:
		n, _ := strconv.ParseInt(x, 10, 64)
		return n
	default:
		return 0
	}
}

func text(v interface{}) string {
	if v == nil {
		return ""
	}
	return fmt.Sprint(v)
}

func scoreStory(caption string, views, likes, comments, shares int64) (int, []string) {

	t := strings.ToLower(caption)

	score := 0
	reasons := []string{}

	positive := map[string]int{
		"unexpected":        18,
		"nobody expected":  20,
		"what happened":     16,
		"caught on camera":  15,
		"found":             12,
		"discovered":        12,
		"rescued":           14,
		"rescue":            14,
		"saved":             12,
		"accident":          12,
		"strange":           10,
		"shocking":          10,
		"shocked":           10,
		"crazy":              7,
		"reaction":           9,
		"inside":             8,
		"hidden":             8,
		"secret":             8,
		"then":               5,
		"finally":            5,
		"turned out":         12,
		"went viral":         8,
	}

	negative := map[string]int{
		"makeup":        40,
		"beauty":        35,
		"skincare":      35,
		"gym":           35,
		"fitness":       35,
		"workout":       35,
		"dance":         35,
		"lip sync":      40,
		"podcast":       30,
		"interview":     25,
		"outfit":        30,
		"fashion":       30,
		"motivation":    30,
		"giveaway":      30,
		"advertisement": 45,
		"crypto":        35,
		"forex":         35,
	}

	for word, points := range positive {
		if strings.Contains(t, word) {
			score += points
			reasons = append(reasons, word)
		}
	}

	for word, points := range negative {
		if strings.Contains(t, word) {
			score -= points
		}
	}

	if views >= 1000000 {
		score += 15
		reasons = append(reasons, "yüksek izlenme")
	} else if views >= 100000 {
		score += 8
		reasons = append(reasons, "iyi izlenme")
	}

	if likes >= 100000 {
		score += 12
		reasons = append(reasons, "yüksek etkileşim")
	} else if likes >= 10000 {
		score += 6
	}

	if comments >= 10000 {
		score += 8
		reasons = append(reasons, "yüksek yorum")
	}

	if shares >= 10000 {
		score += 10
		reasons = append(reasons, "çok paylaşım")
	}

	if score < 0 {
		score = 0
	}

	if score > 100 {
		score = 100
	}

	return score, reasons
}

func findString(m map[string]interface{}, keys ...string) string {

	for _, key := range keys {
		if v, ok := m[key]; ok {
			if s := text(v); s != "" {
				return s
			}
		}
	}

	return ""
}

func findNumber(m map[string]interface{}, keys ...string) int64 {

	for _, key := range keys {
		if v, ok := m[key]; ok {
			n := number(v)
			if n > 0 {
				return n
			}
		}
	}

	return 0
}

func runTikTok(query string) ([]Video, string, error) {

	binary := "/opt/render/project/src/bin/tt"

	cmd := exec.Command(
		binary,
		"search",
		query,
		"-n",
		"30",
		"-o",
		"jsonl",
		"-q",
		"--timeout",
		"20s",
	)

	stdout, err := cmd.StdoutPipe()

	if err != nil {
		return nil, "", err
	}

	stderr, _ := cmd.StderrPipe()

	start := time.Now()

	if err := cmd.Start(); err != nil {
		return nil, "", err
	}

	var stderrText strings.Builder

	go func() {

		scanner := bufio.NewScanner(stderr)

		for scanner.Scan() {
			stderrText.WriteString(scanner.Text())
			stderrText.WriteString("\n")
		}

	}()

	results := []Video{}

	scanner := bufio.NewScanner(stdout)

	for scanner.Scan() {

		line := strings.TrimSpace(scanner.Text())

		if line == "" {
			continue
		}

		var raw map[string]interface{}

		if json.Unmarshal(
			[]byte(line),
			&raw,
		) != nil {
			continue
		}

		id := findString(
			raw,
			"id",
			"video_id",
			"aweme_id",
		)

		url := findString(
			raw,
			"url",
			"video_url",
			"share_url",
			"web_url",
		)

		caption := findString(
			raw,
			"desc",
			"description",
			"caption",
			"text",
		)

		author := findString(
			raw,
			"unique_id",
			"author",
			"username",
		)

		views := findNumber(
			raw,
			"play_count",
			"views",
			"view_count",
		)

		likes := findNumber(
			raw,
			"digg_count",
			"likes",
			"like_count",
		)

		comments := findNumber(
			raw,
			"comment_count",
			"comments",
		)

		shares := findNumber(
			raw,
			"share_count",
			"shares",
		)

		if id == "" && url == "" {
			continue
		}

		if id == "" {
			id = url
		}

		score, reasons :=
			scoreStory(
				caption,
				views,
				likes,
				comments,
				shares,
			)

		results = append(
			results,
			Video{
				ID:         id,
				URL:        url,
				Author:     author,
				Caption:    caption,
				Views:      views,
				Likes:      likes,
				Comments:   comments,
				Shares:     shares,
				StoryScore: score,
				Reasons:    reasons,
			},
		)
	}

	waitErr := cmd.Wait()

	duration :=
		time.Since(start).Round(time.Millisecond).String()

	if waitErr != nil {

		msg := strings.TrimSpace(
			stderrText.String(),
		)

		if msg == "" {
			msg = waitErr.Error()
		}

		return nil, duration,
			fmt.Errorf("%s", msg)
	}

	return results, duration, nil
}

func filterDuplicates(results []Video) []Video {

	final := []Video{}

	seenMu.Lock()
	defer seenMu.Unlock()

	for _, video := range results {

		if video.ID == "" {
			continue
		}

		if seen[video.ID] {
			continue
		}

		seen[video.ID] = true

		final = append(final, video)
	}

	return final
}

func scanHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set(
		"Content-Type",
		"application/json; charset=utf-8",
	)

	query :=
		r.URL.Query().Get("q")

	if query == "" {
		query = "unexpected"
	}

	results, duration, err :=
		runTikTok(query)

	if err != nil {

		json.NewEncoder(w).Encode(
			ScanResponse{
				OK:       false,
				Message: "TikTok araması başarısız: " + err.Error(),
				Results:  []Video{},
				Source:   "tiktok-cli",
				Duration: duration,
			},
		)

		return
	}

	results =
		filterDuplicates(results)

	// Hikâye skoruna göre sırala.
	for i := 0; i < len(results); i++ {

		for j := i + 1; j < len(results); j++ {

			if results[j].StoryScore >
				results[i].StoryScore {

				results[i], results[j] =
					results[j], results[i]
			}
		}
	}

	json.NewEncoder(w).Encode(
		ScanResponse{
			OK:       true,
			Message: fmt.Sprintf("%d yeni hikâye adayı bulundu.", len(results)),
			Results:  results,
			Source:   "TikTok public web + tiktok-cli",
			Duration: duration,
		},
	)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set(
		"Content-Type",
		"application/json; charset=utf-8",
	)

	json.NewEncoder(w).Encode(
		map[string]interface{}{
			"ok":      true,
			"message": "Story Hunter backend çalışıyor.",
		},
	)
}

func main() {

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	http.HandleFunc(
		"/health",
		healthHandler,
	)

	http.HandleFunc(
		"/scan",
		scanHandler,
	)

	fmt.Println(
		"Story Hunter backend starting on port",
		port,
	)

	err :=
		http.ListenAndServe(
			":"+port,
			nil,
		)

	if err != nil {
		fmt.Println(
			"Server error:",
			err,
		)
	}
}