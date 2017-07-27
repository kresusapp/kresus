.PHONY: help install-node-dev-deps localrun install build dev lint lint-full lint-client lint-server test check release docker-release docker-nightly

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install-node-dev-deps: ## Installs all node dependencies for a development environment.
	npm install

localrun: install-node-dev-deps build ## Runs the standalone version of kresus, from this directory.
	NODE_ENV=production node bin/kresus.js

install: ## Globally install a prebuilt standalone version of kresus.
	npm -g install kresus

# Dev rules:

build: ## Transpiles ES6 files to ES5, moves files and concatenate them to obtain a usable build.
	./scripts/build.sh

dev: build ## As build, but retriggers incremental compilation as the files are changed on disk.
	./scripts/dev.sh

lint: ## Runs the linter for the server and the client, without warnings.
	./scripts/lint.sh --quiet

lint-full: ## Runs the linter for the server and the client, with warnings.
	./scripts/lint.sh

lint-client: ## Runs the linter on the client.
	./scripts/lint.sh ./client

lint-server: ## Runs the linter on the server.
	./scripts/lint.sh ./server

test: ## Runs all the tests.
	./scripts/test.sh

check: ## Runs all tests and style checks.
	./scripts/check.sh

release: ## Prepares for a release. To be done only on the `builds` branch.
	./scripts/release.sh

docker-release: ## Prepares for a Docker release. Must be done after make release.
	docker build -t bnjbvr/kresus -f docker/Dockerfile-stable .

docker-nightly: ## Prepares for a Docker nightly (no need for make release).
	docker build -t bnjbvr/kresus-nightly -f docker/Dockerfile-nightly .
