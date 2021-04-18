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

cd /woob
if [ ! -d /woob/.git ]; then
    echo "[ENTRYPOINT] Installing woob..."
    git clone --depth 1 https://gitlab.com/woob/woob.git .
    echo "[ENTRYPOINT] Done installing."
else
    echo "[ENTRYPOINT] Updating woob..."
    git pull || echo "Couldn't update; maybe the Woob's server is unreachable?"
    echo "[ENTRYPOINT] Done updating."
fi

echo "[ENTRYPOINT] Updating Woob dependencies..."
python ./setup.py requirements > /tmp/requirements.txt
pip install -r /tmp/requirements.txt
rm /tmp/requirements.txt
echo "[ENTRYPOINT] Done updating Woob dependencies."

echo "[ENTRYPOINT] Trying to update kresus..."
npm update -g kresus
echo "[ENTRYPOINT] Done."

echo "[ENTRYPOINT] Changing rights on user home directory..."
chown -R user:user /home/user

echo "[ENTRYPOINT] Changing rights on /woob directory..."
chown -R user:user /woob

# Change config rights
chown user:user /opt/config.ini
chmod 600 /opt/config.ini

echo "[ENTRYPOINT] Running kresus as user."
exec su user -c "$@"
