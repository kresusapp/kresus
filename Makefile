.PHONY: all build dev lint lint-client lint-server test release run run-cozy install-node-deps install install-debian-deps install-debian

all: build

build:
	./scripts/build.sh

dev: build
	./scripts/dev.sh

lint:
	./scripts/lint.sh

lint-client:
	./scripts/lint.sh ./client

lint-server:
	./scripts/lint.sh ./server

test:
	./scripts/test.sh

release: build
	git add -f build/
	git status

run: install-node-deps
	node bin/kresus.js

run-cozy: install-node-deps
	node build/server/index.js

install-node-deps:
	npm install --production

install:
	npm -g install --production

install-debian-deps:
	sudo apt-get update
	sudo apt-get install -y python-weboob-core

install-debian: install install-debian-deps
