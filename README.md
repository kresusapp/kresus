# Kresus

Kresus is a personal finance manager hosted on your cozy server. It allows you
to safely track your banking history, check your overall balance and know
exactly on what you are spending money with the use of tags!

It's a fork of [cozy-pfm](https://github.com/seeker89/cozy-pfm), because I can't deal with backbone.

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bnj&url=https://github.com/bnjbvr/kresus&title=Kresus&language=&tags=github&category=software)

# How do I install Kresus in my Cozy instance?

If you already have a Cozy instance setup, then you can install Kresus either
from the Marketplace or by hopping on the machine and running the following
command:

```cozy-monitor install kresus -r https://github.com/bnjbvr/kresus```

## Hack

If you want to hack on kresus, be sure to have installed gulp on your
machine.

```npm install -g gulp```

(of course, install dependencies for the application)

```npm install```

And then use ```gulp b``` to transpile ES6 files to ES5.

Hacking on Kresus requires the Cozy dev environment (or just a CouchDB plus the
[Data System](https://github.com/mycozycloud/cozy-data-system)).

Then you can start Kresus this way:

```npm start```

### Can i propose a pull request?

Oh yeah, that'd be awesome! If you think about it, create a branch on your fork
and if you feel like sending a pull request, please propose to merge into the
`incoming` branch (not `master`). Then I'll give it a look and will most
certainly accept it!

### Firewall recommendations

Note that Kresus will need to install Weboob at startup, and to do so it needs
the following firewall authorizations:

- git access to `git.symlink.me/` and the `pipy`, for installing weboob.
- http/https access to your bank website, for fetching new operations on your
  behalf.

### Code of conduct

There is a [code of conduct](https://github.com/bnjbvr/kresus/blob/master/CodeOfConduct.md) that everybody is expected to follow. Read it
for further information about how to behave, how to report abuses, etc.

## What is Cozy?

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

