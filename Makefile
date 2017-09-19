.PHONY: help install-node-dev-deps localrun install build dev lint lint-full lint-client lint-server test check release docker-release docker-nightly

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install-node-dev-deps: ## Installs all node dependencies for a development environment.
	npm install

localrun: install-node-dev-deps build ## Runs the standalone version of kresus, from this directory.
	NODE_ENV=production npm run kresus

install: ## Globally install a prebuilt standalone version of kresus.
	npm -g install kresus

# Dev rules:

build: ## Transpiles ES6 files to ES5, moves files and concatenate them to obtain a usable build.
	./scripts/build-server.sh && npm run build:client

dev: build ## As build, but retriggers incremental compilation as the files are changed on disk.
	./scripts/dev-server.sh & npm run watch:dev:client

lint: ## Runs the linter for the server and the client, without warnings.
	npm run check:lint

lint-full: ## Runs the linter for the server and the client, with warnings.
	npm run check:lint-full

lint-client: ## Runs the linter on the client.
	npm run check:lint -- ./client

lint-server: ## Runs the linter on the server.
	npm run check:lint -- ./server

test: ## Runs all the tests.
	npm run check:test

check: ## Runs all tests and style checks.
	npm run check

release: ## Prepares for a release. To be done only on the `builds` branch.
	./scripts/release.sh

docker-release: ## Prepares for a Docker release. Must be done after make release.
	docker build -t bnjbvr/kresus -f docker/Dockerfile-stable .

docker-nightly-base: ## Prepares for a Docker nightly base image.
	docker build -t bnjbvr/kresus-nightly-base -f docker/Dockerfile-nightly-base .

docker-nightly-dev: docker-nightly-base ## Prepares for a Docker nightly developer image.
	docker build -t bnjbvr/kresus-nightly-dev -f docker/Dockerfile-nightly-dev ./docker

docker-nightly-prod: docker-nightly-base ## Prepares for a Docker nightly production ready image.
	docker build -t bnjbvr/kresus-nightly-prod -f docker/Dockerfile-nightly-prod ./docker
