.PHONY: all build dev lint run run-cozy install-node-deps install install-debian-deps install-debian lint

all: build

build:
	./scripts/build.sh

dev: build
	./scripts/dev.sh

lint:
	./scripts/lint.sh

run: install-node-deps
	node bin/kresus.js

run-cozy: install-node-deps
	node build/server/index.js

# npm install also causes a build, see package.json
install-node-deps:
	npm install

install:
	npm -g install

install-debian-deps:
	sudo apt-get install -y python-dev libffi-dev libxml2-dev libxslt-dev libyaml-dev libjpeg-dev libyaml-dev python-virtualenv npm

install-debian: install-debian-deps install
