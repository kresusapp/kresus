#!/bin/bash

# Minimal bash script to automatically update Kresus based on the pre-release tag.
#
# Must be run by root.
#
# How to run:
# - tweak the environment variables below at the top (e.g. `KRESUS_DIR`).
# - make the script executable with `chmod +x autoupdate.sh`.
# - make sure to tweak the last line that restarts the Kresus Web application, if needs be.
# - try it out manually with `./autoupdate.sh`.
#
# Once you've confirmed that it worked like you wanted, add a crontab line like:
# `0 1 * * * /opt/kresus/autoupdate.sh`
# This will automatically update Kresus every night at 1AM.

set -e

# Where the release files will be stored.
# The directory must exist before the script is running for the first time.
# The script will only create if necessary and touch $KRESUS_DIR/prebuild in this directory.
KRESUS_DIR=/opt/kresus

# The unix user owning the files.
USER=kresus

# The unix group owning the files.
GROUP=kresus

cd $KRESUS_DIR
rm -r ./prebuild
mkdir -p ./prebuild
cd ./prebuild
curl -A kresus-auto-updater https://codeberg.org/kresus/kresus/releases/download/pre-release/build.zip -o build.zip
unzip build.zip
rm build.zip
chown -R $USER:$GROUP ../prebuild

# Change this line if needs be!
systemctl restart kresus
