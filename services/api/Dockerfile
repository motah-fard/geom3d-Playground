FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server

FROM alpine:3.20
COPY --from=build /bin/server /bin/server
EXPOSE 8081
ENTRYPOINT ["/bin/server"]
