.PHONY: build-frontend frontend-build image-frontend

# Production static files → ./frontend/build (via Docker; requires Docker disk space)
build-frontend frontend-build:
	cd frontend && docker compose -f docker-compose.build.yml run --rm frontend-build

# Production nginx image (static site on port 80 in image)
image-frontend:
	docker build -t portfolio-frontend:prod ./frontend
