.PHONY: run build test clean install help

# Default target
.DEFAULT_GOAL := help

## help: Display this help message
help:
	@echo "Available targets:"
	@echo "  make run      - Run the application"
	@echo "  make build    - Build the application binary"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make install  - Install dependencies"
	@echo "  make fmt      - Format code"
	@echo "  make lint     - Run linter"

## install: Install dependencies
install:
	@echo "📦 Installing dependencies..."
	go mod download
	go mod tidy

## run: Run the application
run:
	@echo "🚀 Starting application..."
	go run main.go

## build: Build the application
build:
	@echo "🔨 Building application..."
	go build -o bin/server main.go
	@echo "✅ Binary created at bin/server"

## test: Run tests
test:
	@echo "🧪 Running tests..."
	go test -v ./...

## clean: Clean build artifacts
clean:
	@echo "🧹 Cleaning..."
	rm -rf bin/
	go clean

## fmt: Format code
fmt:
	@echo "✨ Formatting code..."
	go fmt ./...

## lint: Run linter
lint:
	@echo "🔍 Running linter..."
	golangci-lint run || echo "golangci-lint not installed. Install with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"
