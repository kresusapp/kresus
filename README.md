# kresus

Kresus is a fork of cozy-pfm, because i can't deal with backbone.

Safely track your banking histroy, check your overall balance and know exactly on what you are spending money!

[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=bnj&url=https://github.com/bnjbvr/kresus&title=Kresus&language=&tags=github&category=software)

## Hack

To be hacked, the PFM requires the dev environment (or just a CouchDB plus the [Data System](https://github.com/mycozycloud/cozy-data-system)). Then you can start the PFM
this way:

    coffee server.coffee

If you want to hack the client, you can just install watchify (```npm install
-g watchify```), install all dev-dependencies (```npm install```) and then run
the dev command that will setup watchify on your behalf: ```npm run dev```.

## What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

