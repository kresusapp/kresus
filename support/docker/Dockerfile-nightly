FROM node:10
MAINTAINER Benjamin Bouvier <public@benj.me>

# Install Weboob OS-level dependencies.
RUN apt-get update \
 && apt-get install -y git python python-dev libffi-dev \
    libxml2-dev libxslt-dev libyaml-dev libtiff-dev libjpeg-dev zlib1g-dev \
    libfreetype6-dev libwebp-dev build-essential gcc g++ wget unzip mupdf-tools \
 && rm -rf /var/lib/apt/lists/;

# Install Weboob python dependencies
RUN mkdir /tmp/install && \
    cd /tmp/install && \
    wget https://bootstrap.pypa.io/get-pip.py && \
    python ./get-pip.py && \
    pip install -U setuptools && \
    pip install html2text simplejson BeautifulSoup PyExecJS pdfminer && \
    rm -rf /tmp/install;

# Setup kresus layout.
RUN useradd -d /home/user -m -s /bin/bash -U user && \
    mkdir -p /home/user/data && \
    mkdir -p /weboob;

COPY ./config.example.ini /opt/config.ini
RUN chmod -x /opt/config.ini
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# -> Install and compile the app.
RUN cd /home/user && \
    wget https://github.com/kresusapp/kresus/archive/master.zip && \
    unzip master.zip && \
    rm master.zip && \
    mv kresus-master app && \
    cd /home/user/app && \
    npm install && \
    npm run build:prod && \
    rm -rf node_modules && \
    npm install --production && \
    chown -R user:user /home/user;

WORKDIR /home/user/app

ENV HOST 0.0.0.0
ENV KRESUS_DIR /home/user/data
ENV KRESUS_WEBOOB_DIR /weboob
ENV NODE_ENV production

VOLUME /home/user/data
VOLUME /weboob
EXPOSE 9876

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/home/user/app/bin/kresus.js --config /opt/config.ini"]
