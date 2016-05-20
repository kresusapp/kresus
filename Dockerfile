FROM node:4.4.4-slim
MAINTAINER Benjamin Bouvier <public@benj.me>

# Install system dependencies
RUN apt-get update -y && \
    apt-get install -y python-weboob-core && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Setup project layout
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY build /usr/src/app/build
COPY bin /usr/src/app/bin

# Install app dependencies
COPY package.json package.json
RUN npm install --production

# Run server
CMD bin/kresus.js
