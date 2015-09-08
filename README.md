# Kresus

Kresus is a personal finance manager hosted on your cozy server. It allows you
to safely track your banking history, check your overall balance and know
exactly on what you are spending money with the use of tags!

It's a fork of [cozy-pfm](https://github.com/seeker89/cozy-pfm), because I can't deal with backbone.

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bnj&url=https://github.com/bnjbvr/kresus&title=Kresus&language=&tags=github&category=software)

# How do I install Kresus?

## On CozyCloud

If you already have a Cozy instance set up, then you can install Kresus either
from the Marketplace or by hopping on the machine and running the following
command:

```cozy-monitor install kresus -r https://github.com/bnjbvr/kresus```

## On Debian

Kresus can be installed standalone, without a cozy, but it will run
without a few features (e.g. email notifications).

```make install-debian```

This will install the dependencies, build the project and install at the global
node.js program location. Note that if this location is `/usr/local/bin`, you
might need to use root access to apply this command properly.

## On any other (UNIX based) operating system

1. Make sure to have installed all the dependencies.

    On Debian based operating systems, these are `python-dev libffi-dev
libxml2-dev libxslt-dev libyaml-dev python-virtualenv` and can be installed
with `make install-debian-deps`.

    For Fedora (as of version 22), these are `python-devel libffi-devel
libxml2-devel libxslt-devel libyaml-devel` and `virtualenv`.

    You'll also need a machine with at least **1 GB of RAM**, for compiling
python modules needed for Weboob.

1. When the OS dependencies have been installed, install the node dependencies
and build the scripts (this won't install kresus globally). This command will
do all of it and start Kresus:

    ```make run```

Note that it runs on **port 9876** by default; this can be overridden by
setting the env variable `PORT`:

    ```PORT=1989 make run```

1. Alternatively, if you want to install Kresus globally, you'll need to use

    ```make install```

    And then you can simply start Kresus from any terminal in any directory with:

    `kresus`

Note that databases are saved in `~/.kresus`, by default.


## Firewall recommendations

Note that Kresus will need to install Weboob at startup, and to do so it needs
the following firewall authorizations:

- git access to `git.symlink.me/` and the `pipy`, for installing weboob.
- http/https access to your bank website, for fetching new operations on your
  behalf.

# Hack

If you want to hack on kresus, you'll need to install the app's dependencies:

```make install-node-deps```

Then, you can use ```make dev``` to automatically compile files to JS, prepare
and move files around, etc.

If the auto-watching doesn't work, under UNIX based operating systems (Linux,
MacOS), you might need to [increase the number of inotify
nodes](https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit).

### Can I propose a pull request?

Oh yeah, that'd be awesome! If you think about it, create a branch on your fork
and if you feel like sending a pull request, please propose to **merge into the
`incoming` branch (not `master`)**. Then I'll give it a look and will most
certainly accept it!

# Code of conduct

There is a [code of conduct](https://github.com/bnjbvr/kresus/blob/master/CodeOfConduct.md)
that everybody is expected to follow. Read it for further information about how
to behave, how to report abuses, etc.

## What is Cozy?

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

