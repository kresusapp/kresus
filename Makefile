.PHONY: help run run-cozy install-node-deps install install-debians-deps install-debian install-node-dev-deps build dev lint lint-client lint-server test release

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

run: install-node-deps ## Runs the standalone version of kresus, from this directory.
	node bin/kresus.js

run-cozy: install-node-deps ## Runs the CozyCloud version of kresus, from this directory.
	node build/server/index.js

install-node-deps: ## Installs all node dependencies for a production environment.
	npm install --production

install: ## Globally install the standalone version of kresus.
	npm -g install --production

install-debian-deps: ## Install the extra Debian dependencies necessary to run Kresus.
	sudo apt-get update
	sudo apt-get install -y python-weboob-core

install-debian: install install-debian-deps ## Globally install Kresus and all its dependencies.

install-node-dev-deps: ## Installs all node dependencies for a development environment.
	npm install

build: ## Transpiles ES6 files to ES5, moves files and concatenate them to obtain a usable build.
	./scripts/build.sh

dev: build ## As build, but retriggers incremental compilation as the files are changed on disk.
	./scripts/dev.sh

lint: ## Runs the linter for the server and the client.
	./scripts/lint.sh

lint-client: ## Runs the linter on the client.
	./scripts/lint.sh ./client

lint-server: ## Runs the linter on the server.
	./scripts/lint.sh ./server

test: ## Runs all the tests.
	./scripts/test.sh

check: ## Runs all tests and style checks.
	./scripts/check.sh

release: ## Prepares for a release. To be done only on the `master` branch.
	@echo "Removing - reinstalling dev dependencies..."
	rm -rf node_modules/
	yarn
	@echo "Building..."
	NODE_ENV=production make build
	rm -rf build/server/weboob/data
	git add -f build/
	@echo "Removing dev dependencies and installing production dependencies before shrinkwrap..."
	rm -rf node_modules/
	npm install --production # yarn doesn't allow shrinkwrap.
	npm shrinkwrap
	git add npm-shrinkwrap.json
	git status
	@echo "This is what is about to be committed. Check this and commit."
