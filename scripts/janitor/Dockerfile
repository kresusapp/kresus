FROM janx/ubuntu-dev
MAINTAINER Benjamin Bouvier <public@benj.me>

# Weboob and its dependencies.
RUN apt-get update && \
    apt-get install -y python python-setuptools python-dev libffi-dev \
    libxml2-dev libxslt-dev libyaml-dev libtiff-dev libjpeg-dev zlib1g-dev \
    libfreetype6-dev libwebp-dev build-essential gcc g++ wget;

# Global install of weboob.
USER root

RUN cd /tmp && \
    wget https://bootstrap.pypa.io/get-pip.py && \
    python ./get-pip.py && \
    pip install html2text simplejson BeautifulSoup

RUN git clone https://git.weboob.org/weboob/devel /tmp/weboob \
    && cd /tmp/weboob \
    && python ./setup.py install \
    && rm -rf /tmp/weboob

# Setup kresus layout.
USER user

RUN mkdir -p /home/user/kresus/data

# Install app and dependencies.
WORKDIR /home/user/kresus
RUN git clone https://framagit.org/bnjbvr/kresus app

WORKDIR /home/user/kresus/app
RUN npm install

# Useful environment variables.
ENV HOST 0.0.0.0
ENV PORT 9876
ENV KRESUS_DIR /home/user/kresus/data

# Expose the port on which Kresus is running.
EXPOSE 9876

# Become root again so that supervisord is run with the right permissions.
USER root
