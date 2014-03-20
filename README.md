# [Cozy](http://cozy.io) Personal Finance Manager

Safely track your banking histroy, check your overall balance and know exactly on what you are spending money!

## Contribution

You can contribute to the Cozy Proxy in many ways:

* Pick up an [issue](https://github.com/mycozycloud/cozy-proxy/issues?state=open) and solve it.
* Translate it in [a new language](https://github.com/mycozycloud/cozy-proxy/tree/master/client/app/locales).
* Improve the tests (there is already the structure)

### Contributors

* Mikolaj Pawlikowski ([@seeker89](https://github.com/seeker89))
* CozyCloud team ([@mycozycloud](https://github.com/mycozycloud))
* Jean-Philippe Braun ([@eonpatapon](https://github.com/eonpatapon))

## Hack

To be hacked, the PFM requires the dev environment (or just a CouchDB plus the [Data System](https://github.com/mycozycloud/cozy-data-system)). Then you can start the PFM
this way:

    https://github.com/seeker89/cozycloud-pfm.git
    coffee server.coffee

Since the sources are in CoffeeScript, each modification requires a new build **before pushing** (you can just develop with the coffee version). Here is how to run a build:

    cake build

## Tests

To run tests type the following command into the Cozy Home folder:

    cake tests

## License

Cozy Proxy is developed by Cozy Cloud and distributed under the AGPL v3 license.

## What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you with a new experience. You can install Cozy on your own
hardware where no one profiles you.

## Community

You can reach the Cozy Community by:

* Chatting with us on IRC #cozycloud on irc.freenode.net
* Posting on our [Forum](https://groups.google.com/forum/?fromgroups#!forum/cozy-cloud)
* Posting issues on the [Github repos](https://github.com/mycozycloud/)
* Mentioning us on [Twitter](http://twitter.com/mycozycloud)
