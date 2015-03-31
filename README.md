# kresus

Kresus is a fork of cozy-pfm, because i can't deal with backbone.

Safely track your banking histroy, check your overall balance and know exactly on what you are spending money!

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bnj&url=https://github.com/bnjbvr/kresus&title=Kresus&language=&tags=github&category=software)

## hack

If you want to hack on kresus, be sure to have installed gulp on your
machine

```npm install -g gulp```

(of course, install dependencies for the application)

```npm install```

And use the `w` (watch) target of gulp:

```gulp w```

This will auto-rebuild jsx files, move files around, and compile coffee
scripts.

### dependencies

Hacking on Kresus requires the Cozy dev environment (or just a CouchDB plus the [Data System](https://github.com/mycozycloud/cozy-data-system)). Then you can start Kresus
this way:

    coffee server.coffee

## What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

