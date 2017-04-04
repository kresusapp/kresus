# Kresus

Kresus is an open-source [libre](LICENSE) self-hosted personal finance manager.
It allows you to safely track your banking history, check your overall balance
and know exactly on what you are spending money with the use of tags!

It has started as a fork of [cozy-pfm](https://github.com/seeker89/cozy-pfm)
but is way different now.

If you like the work we're doing, consider making a donation!

[![Make a recurrent donation](https://liberapay.com/assets/widgets/donate.svg)](https://liberapay.com/bnjbvr/donate)
[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bnj&url=https://github.com/bnjbvr/kresus&title=Kresus&language=&tags=github&category=software)

# How to install Kresus

## Pre-requisites

Kresus uses [Weboob](http://weboob.org/) under the hood, to connect to your
bank website. You'll need to [install Weboob](http://weboob.org/install) core
modules so that the user executing the Kresus server can use them.

Note that Kresus needs the latest stable version of Weboob. Although Kresus
would also work with previous versions, bank modules might be outdated and not
updated anymore, and as a result synchronization with your bank website would
not work and/or display erroneous results.

## Standalone install

**DISCLAIMER: There are no builtin authentication systems in the standalone
Kresus and it is therefore more risky to use it in the wild. Choose this only
if you know what you're doing and you're able to handle authentication by
yourself.**

This will install the dependencies, build the project and install the program
in the global node.js bin directory. Note that if this location is
`/usr/local/bin`, you might need to use root access to run this command.

### Local setup

Install the node dependencies and build the scripts (this won't install
kresus globally):

    make localrun

### Global setup

Alternatively, if you want to install Kresus globally, you'll need to use

    make install

And then you can simply start Kresus from any terminal in any directory with:

    kresus

## With Docker

### Run a pre-built image

```
docker run -p 9876:9876 -v /opt/kresus/data:/home/user/data -ti -d bnjbvr/kresus
```

### Build the image
There is a Dockerfile from which you can build and run Kresus, using the
following commands (don't forget to change the port mapping and the volume
mapping, if necessary!):

- `git clone https://framagit.org/bnjbvr/kresus && cd kresus`
- `docker build -t kresus .`
- `docker run -p 9876:9876 -v /opt/kresus/data:/home/user/data -ti -d kresus`

## Install on CozyCloud

If you already have a Cozy instance set up, then your best (and
[only](https://github.com/cozy/cozy-home/issues/789)) choice is to install
Kresus from the Marketplace.

# Runtime options

Note that whatever the launch process you're using (global or local install),
you can set several options at runtime:

- the default **port** is 9876. This can be overriden with the env variable
  `PORT`.

- the default **host** on which Kresus listens is `localhost`. This can be
  overriden with the env variable `HOST`.

- in standalone mode, the default install location is `~/.kresus/`. This can be
  overriden with the env variable `KRESUS_DIR`.

- in standalone mode, if Kresus' server isn't served from the root (e.g. it is
  served from `example.com/link/to/my/kresus`), you can override the env
  variable `KRESUS_URL_PREFIX` with the prefix (here, `/link/to/my/kresus`). It
  is set to `/` by default.

## Firewall recommendations

You'll need the following firewall authorizations:

- http/https access to your bank website, for fetching new operations on your
  behalf.
- http/https access to the Weboob repositories, for automatically updating the
  bank modules before automatic pollings.

# Contributing

See [contributing](CONTRIBUTING.md).

A big thank you to [all contributors](https://framagit.org/bnjbvr/kresus/graphs/master)!

# Code of conduct

There is a [code of conduct](CodeOfConduct.md) that everybody is expected to
follow. Read it for further information about how to behave, how to report
abuses, etc.
