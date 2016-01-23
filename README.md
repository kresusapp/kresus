# Kresus

![Travis CI status](https://img.shields.io/travis/bnjbvr/kresus.svg)

Kresus is an open-source [libre](LICENSE) self-hosted personal finance manager.
It allows you to safely track your banking history, check your overall balance
and know exactly on what you are spending money with the use of tags!

It has started as a fork of [cozy-pfm](https://github.com/seeker89/cozy-pfm)
but is way different now.

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bnj&url=https://github.com/bnjbvr/kresus&title=Kresus&language=&tags=github&category=software)

# How to install Kresus

## Pre-requisites

Kresus uses [Weboob](http://weboob.org/) under the hood, to connect to your
bank website. You'll need to [install Weboob](https://weboob.org/install) core
modules so that the user executing the Kresus server can use them.

This can be done with the following command, under Debian based systems:

    make install-debian-deps

## Install on CozyCloud

If you already have a Cozy instance set up, then you can install Kresus either
from the Marketplace or by hopping on the machine and running the following
command:

    cozy-monitor install kresus -r https://github.com/bnjbvr/kresus

## Standalone install on Debian

Kresus can be installed standalone (without a cozy). In this case, a few
features won't be enabled: email reports and notifications, simple
notifications.

**DISCLAIMER: as Kresus is designed to run under CozyCloud, which handles
authentication, there are no builtin authentication systems in the standalone
Kresus and it is therefore more risky to use it in the wild. Choose this only
if you know what you're doing and you're able to handle authentication.**

There's a single command to run to install Kresus under Debian:

    make install-debian

This will install the dependencies, build the project and install at the global
node.js program location. Note that if this location is `/usr/local/bin`, you
might need to use root access to apply this command properly.

## On any other (UNIX based) operating system

**DISCLAIMER: the disclaimer above for Debian applies here as well.**

First of all, make sure to have installed all the dependencies, as explained
above.

### Local setup

Install the node dependencies and build the scripts (this won't install
kresus globally):

    make run

### Global setup

Alternatively, if you want to install Kresus globally, you'll need to use

    make install

And then you can simply start Kresus from any terminal in any directory with:

    kresus

# Runtime options

Note that whatever the launch process you're using (global or local install),
you can set several options at runtime:

- the default **port** is 9876. This can be overriden with the env variable
  `PORT`.

- the default **host** on which Kresus listens is `localhost`. This can be
  overriden with the env variable `HOST`.

- in standalone mode, the default install location is `~/.kresus/`. This can be
  overriden with the env variable `KRESUS_DIR`.

## Firewall recommendations

You'll need the following firewall authorizations:

- http/https access to your bank website, for fetching new operations on your
  behalf.

# Contributing

See [contributing](CONTRIBUTING.md).

A big thank you to [all contributors](https://github.com/bnjbvr/kresus/graphs/contributors)!

# Code of conduct

There is a [code of conduct](CodeOfConduct.md) that everybody is expected to
follow. Read it for further information about how to behave, how to report
abuses, etc.

## What is Cozy?

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

