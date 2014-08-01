# kresus

Kresus is a fork of cozy-pfm, because i can't deal with backbone.

Safely track your banking histroy, check your overall balance and know exactly on what you are spending money!

## Hack

To be hacked, the PFM requires the dev environment (or just a CouchDB plus the [Data System](https://github.com/mycozycloud/cozy-data-system)). Then you can start the PFM
this way:

    https://github.com/seeker89/cozycloud-pfm.git
    coffee server.coffee

Since the sources are in CoffeeScript, each modification requires a new build **before pushing** (you can just develop with the coffee version). Here is how to run a build:

    cake build

## What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

