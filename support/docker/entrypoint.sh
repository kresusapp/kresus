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

echo "[ENTRYPOINT] Installing or upgrading woob..."
pip install --break-system-packages -U woob
echo "[ENTRYPOINT] Done installing."

if [ -z $IS_NIGHTLY ]; then
    echo "[ENTRYPOINT] Trying to update kresus..."
    yarn global upgrade kresus --prefix /home/user/app --production
    echo "[ENTRYPOINT] Done."
fi

echo "[ENTRYPOINT] Changing rights on user home directory..."
chown -R user:user /home/user

# Change config rights
chown user:user /opt/config.ini
chmod 600 /opt/config.ini

echo "[ENTRYPOINT] Running kresus as user."
exec su user -c "$@"
