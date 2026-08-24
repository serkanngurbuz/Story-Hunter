# =====================================================
# STORY HUNTER — GO BACKEND
# =====================================================

FROM golang:1.24-alpine AS builder

WORKDIR /app

# Gerekli araçlar
RUN apk add --no-cache git

# Go modülleri
COPY go.mod ./

RUN go mod download

# Kaynak kodu
COPY . .

# TikTok CLI
RUN go install github.com/tamnd/tiktok-cli/cmd/tt@latest

# Go backend'i derle
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o story-hunter main.go


# =====================================================
# RUNTIME
# =====================================================

FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates git

# Go backend
COPY --from=builder /app/story-hunter /app/story-hunter

# TikTok CLI
COPY --from=builder /go/bin/tt /usr/local/bin/tt

# Render'ın vereceği PORT'u kullanabilmesi için
ENV PORT=7777

EXPOSE 7777

# Backend'i çalıştır
CMD ["/app/story-hunter"]
