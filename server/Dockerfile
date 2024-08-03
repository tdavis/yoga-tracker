# syntax=docker/dockerfile:1

FROM golang:1.22

# Set destination for COPY
WORKDIR /app

ENV CGO_ENABLED=0
ENV GOOS=linux
RUN go env -w GOCACHE=/go-cache
RUN go env -w GOMODCACHE=/gomod-cache

# Download Go modules
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/gomod-cache go mod download

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/reference/dockerfile/#copy
COPY .env ./*.go ./

# Build
RUN --mount=type=cache,target=/gomod-cache --mount=type=cache,target=/go-cache go build -o main .

# Optional:
# To bind to a TCP port, runtime parameters must be supplied to the docker command.
# But we can document in the Dockerfile what ports
# the application is going to listen on by default.
# https://docs.docker.com/reference/dockerfile/#expose
EXPOSE 8080

# Run
CMD ["/app/main"]
