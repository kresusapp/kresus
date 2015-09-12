.PHONY: all build dev install-node-deps run install install-debian-deps install-debian

all: build

build:
	./scripts/build.sh

dev: build
	./scripts/dev.sh

install-node-deps:
	npm install

run: build install-node-deps
	node build/server.js

install: build install-node-deps
	npm -g install

install-debian-deps:
	sudo apt-get install --yes python-dev libffi-dev libxml2-dev libxslt-dev

install-debian: install-debian-deps install
