FROM janx/ubuntu-dev
MAINTAINER Benjamin Bouvier <public@benj.me>

# Weboob and its dependencies.
RUN apt-get update && \
    apt-get install -y python python-setuptools python-dev libffi-dev \
    libxml2-dev libxslt-dev libyaml-dev libtiff-dev libjpeg-dev zlib1g-dev \
    libfreetype6-dev libwebp-dev build-essential gcc g++;

# Global install of weboob.
USER root

RUN git clone git://git.symlink.me/pub/weboob/devel.git /tmp/weboob

WORKDIR /tmp/weboob
RUN python ./setup.py install

# Setup kresus layout.
USER user

RUN mkdir -p /home/user/data

# Install app and dependencies.
WORKDIR /home/user
RUN git clone https://framagit.org/bnjbvr/kresus app

WORKDIR /home/user/app
RUN npm install

# Useful environment variables.
ENV HOST 0.0.0.0
ENV KRESUS_DIR /home/user/data

# Expose the port on which Kresus is running.
EXPOSE 9876
