FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git

RUN go install github.com/tamnd/tiktok-cli/cmd/tt@latest

FROM alpine:latest

RUN apk add --no-cache ca-certificates

COPY --from=builder /go/bin/tt /usr/local/bin/tt

EXPOSE 7777

CMD ["tt", "serve", "--addr", ":7777"]
