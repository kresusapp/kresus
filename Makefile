.PHONY: all build dev install-node-deps run install install-debian-deps install-debian

all: build

build:
	./scripts/build.sh

dev: build
	./scripts/dev.sh

# npm install also causes a build, see package.json
install-node-deps:
	npm install

run: install-node-deps
	node bin/kresus.js

run-cozy: install-node-deps
	node build/server.js

install:
	npm -g install

install-debian-deps:
	sudo apt-get install -y python-dev libffi-dev libxml2-dev libxslt-dev libyaml-dev python-virtualenv npm

install-debian: install-debian-deps install
