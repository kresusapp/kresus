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

# Install app dependencies
COPY package.json package.json
RUN npm install --production

# Copy source
COPY build /usr/src/app/build
COPY bin /usr/src/app/bin

# Run server
ENV HOST 0.0.0.0
CMD bin/kresus.js

# Expose the port on which Kresus is running.
EXPOSE 9876
