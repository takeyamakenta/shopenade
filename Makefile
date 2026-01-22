.PHONY: build
build:
	docker build --platform=linux/amd64 -t asia-northeast1-docker.pkg.dev/gyomy-development/basmati/basmati-bff:latest . --no-cache -f Dockerfile.prod

.PHONY: push
push:
	docker build --platform=linux/amd64 -t asia-northeast1-docker.pkg.dev/gyomy-development/basmati/basmati-bff:latest . --no-cache -f Dockerfile.prod
	docker push asia-northeast1-docker.pkg.dev/gyomy-development/basmati/basmati-bff:latest


	
