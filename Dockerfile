FROM node:4.4.4-slim
MAINTAINER Benjamin Bouvier <public@benj.me>

# Weboob and its dependencies.
RUN apt-get update && \
    apt-get install -y git python python-setuptools python-dev libffi-dev \
    libxml2-dev libxslt-dev libyaml-dev libtiff-dev libjpeg-dev zlib1g-dev \
    libfreetype6-dev libwebp-dev build-essential gcc g++;

RUN git clone git://git.symlink.me/pub/weboob/stable.git /tmp/weboob

WORKDIR /tmp/weboob
RUN python ./setup.py install

# Setup kresus layout.
RUN mkdir -p /usr/data
VOLUME /usr/data

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies.
COPY package.json package.json
RUN npm install --production

# Copy source.
COPY build /usr/src/app/build
COPY bin /usr/src/app/bin

# Run server.
ENV HOST 0.0.0.0
ENV KRESUS_DIR /usr/data
CMD bin/kresus.js

# Expose the port on which Kresus is running.
EXPOSE 9876
