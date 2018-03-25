.PHONY: help install build watch dev lint test check release docker-release docker-nightly

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Globally install a prebuilt version of kresus.
	npm -g install kresus

prod: ## Builds in prod mode. Transpiles ES6 files to ES5, moves files and concatenate them to obtain a usable build.
	yarn build:prod

build: ## Builds in dev mode. Transpiles ES6 files to ES5, moves files and concatenate them to obtain a usable build.
	yarn build:dev

watch: ## As build, but retriggers incremental compilation as the files are changed on disk.
	yarn watch

dev: ## Runs servers that get relaunched whenever a built file changes.
	yarn dev

pretty:
	yarn fix:lint

lint: ## Runs the linter for the server and the client, without warnings.
	yarn check:lint

test: ## Runs all the tests.
	yarn check:test

check: ## Runs all tests and style checks.
	yarn check

release: ## Prepares for a release. To be done only on the `builds` branch.
	yarn release

docker-release: ## Prepares for a Docker release. Must be done after make release.
	docker build -t bnjbvr/kresus -f docker/Dockerfile-stable .

docker-nightly: ## Prepares for a Docker nightly image.
	docker build -t bnjbvr/kresus-nightly -f docker/Dockerfile-nightly ./docker
