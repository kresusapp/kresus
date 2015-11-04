#!/bin/bash

cd weboob
rm -rf env

# Let's find out if Python's virtualenv is installed and, if so, what name its binary has
pyvenv=""
if [[ -z $(type -p virtualenv) ]]; then
	if [[ -z $(type -p virtualenv2) ]]; then
		# Couldn't find virtualenv nor virtualenv2, we exit the script
		echo "Virtualenv is not installed"
		return 1
	else
		pyvenv="virtualenv2"
	fi
else
	pyvenv="virtualenv"
fi

mkdir -p ./env && $pyvenv ./env && source ./env/bin/activate && pip install -r requirements.txt && cd .. && ./weboob/scripts/test.sh
