#!/bin/bash

set -e

# Add local user
# Either use the LOCAL_USER_ID if passed in at runtime or
# fallback

USER_ID=${LOCAL_USER_ID:-9001}

echo "[ENTRYPOINT] Starting with UID : $USER_ID"
usermod -u $USER_ID -o user
export HOME=/home/user

echo "[ENTRYPOINT] Setting fake values for git config..."
git config --global user.email kresus@example.com
git config --global user.name "Kresus Root"

cd /weboob
if [ ! -d /weboob/.git ]; then
    echo "[ENTRYPOINT] Installing weboob..."
    git clone --depth 1 https://git.weboob.org/weboob/devel .
    echo "[ENTRYPOINT] Done installing."
else
    echo "[ENTRYPOINT] Updating weboob..."
    git pull || echo "Couldn't update; maybe the Weboob's server is unreachable?"
    echo "[ENTRYPOINT] Done updating."
fi

echo "[ENTRYPOINT] Updating Weboob dependencies..."
cd /weboob
python ./setup.py requirements > /tmp/requirements.txt
pip install -r /tmp/requirements.txt
rm /tmp/requirements.txt
echo "[ENTRYPOINT] Done updating weboob dependencies."

echo "[ENTRYPOINT] Trying to update kresus..."
npm update -g kresus
echo "[ENTRYPOINT] Done."

echo "[ENTRYPOINT] Changing rights..."
chown -R user:user /home/user
chown -R user:user /weboob

# TODO temporary fix until we get a proper location for the weboob data dir
chown -R user:user /usr/local/lib/node_modules/kresus || echo "(no kresus found in /usr/local/lib)"

# Change config rights
chown user:user /opt/config.ini
chmod 600 /opt/config.ini

echo "[ENTRYPOINT] Running kresus as user."
exec su user -c "$@"
