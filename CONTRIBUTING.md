This file describes how to contribute **code** to Kresus. Note that many other
contributions are valuable and would be glady accepted in all of the following
domains: design, user interface, user experience, translations, documentation,
tutorials. If you want to get started with those, please head to our [community
forum](https://community.kresus.org). The only limit is the imagination!

These rules and recommendations can change over time, and should change. If you
have any ideas for improving them, please file an issue or open a merge
request!

# TL;DR

- Branch off `master`.
- One feature per commit.
- In case of requests for changes, amend your commit.

# How to hack on Kresus

- First, install the app's dependencies:
```bash
npm install
```
- Copy `config.example.ini` to `config.ini` and set values for your local
  development environment.
- Start development mode: `make dev`. This will automatically build the server
  and client files, spawn the main server on localhost:9876, (and reload it
  whenever a server source file is changed), spawn a client server on
  localhost:8080 and opens the index page on a browser (which gets reloaded
  every time a client file is touched).

Alternatively, you can use `make watch` which will just automatically recompile
the files without auto-spawning servers.

If watching doesn't work, under Unix based operating systems (Linux, MacOS),
you might need to [increase the number of inotify
nodes](https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit).

# Running tests

A series of tests are shipped with the code to avoid regressions. They are
located in the `./tests` folder.
Some tests require a valid install of Weboob to work properly, some others do not.
For that, the weboob related tests are disabled if the environment variable
`KRESUS_WEBOOB_DIR` is not set. Some other tests are disabled if this
environment variable is set.
To ensure all the tests pass, you need to run the test command twice, once with
`KRESUS_WEBOOB_DIR` set, once without. For example:

```bash
npm run check:test
KRESUS_WEBOOB_DIR=/path/to/weboob npm run check:test
```

# About `package.json` file

We use the `package.json` file in a reproducible way, specifying the exact
version to use. Please make sure all version numbers are **exact** in
`package.json`, thus using no version ranges specifiers like `~`, `>` etc.

# About scripts and `scripty`

To not have shell scripts in `package.json`, we use `scripty`: every command
that has form `a:b:c` in the package descriptor file and that's sent to
`scripty` will run the script `scripts/a/b/c.sh` or `scripts/a/b/c/index.sh`
automatically.

# About branches

- `master` contains all changes in the current development version, including
  some experimental features that could break in production.
- `builds` contains a stable version of the code for releases.

# How to contribute

- Please note that not every feature can make it into Kresus. New features add
  complexity and usually the maintenance burden is carried by the core team.
  Also, Kresus tries to limit its scope to doing one thing well.
- If you're thinking about a new feature, see if there's already an issue open
  about it (but don't sweat it too much if you can't find one!), or open one
  otherwise. This will ensure that everybody is on track for the feature and
  willing to have it in Kresus.
- One commit per feature.
- Branch off the `master` branch.
- Rebase when you're close to landing, to make sure there's no [merge
  skew](https://bors.tech/essay/2017/02/02/pitch/) risk. We don't do merge
  commits, because they break bisection and add a lot of noise in the commit
  history.
- Test your code with `make check`. This also runs linting and a few
  consistency checks.
- For client changes, it is highly recommended to run extensive tests, and to
  note if there are tests known to fail. In particular, when touching a form,
  it's strongly advised to try to use invalid data, run it, close it, enter
  data and close it and re-open it, etc.
- We'll look at your MR and might ask for a few changes. In this case, use your
  best judgement to consider wheter it's smarter to create new commits or to
  amend existing ones. When the final result looks good, we may ask you to
  squash the WIP commits into a single one, to maintain the invariant of "one
  feature, one commit".

# Core team

- Core contributors: `nicofrand`, `ZeHiro`, `Phyks`. Core contributors can
  review and merge MRs, and have full power on the repository, including but
  not limited to push access on the `master` branch.
- Module owner: `bnjbvr` (if alive). They get the last word and can veto the
  progression of a particular merge request, which should only happen in last
  resort if no cooperative solutions have been found otherwise.

# Review and merge rules

- More than one person must have the commit accesses on `master`.
- All code changes must pass through the process of review. As a matter of
  fact, it is not allowed to push directly on the `master` branch. All changes
  must go through a merge request.
- All merge requests must be reviewed and approved by at least one core
  contributor before they can be considered for a merge. The marking of a merge
  request with the `ship-it` label indicates that a merge request can be merged
  by the author, once the remaining issues / remarks have been addressed; of
  course, if other questions arise, the author can ask for another round of
  review (and unmark the MR as `ship-it`).
- Merge requests shouldn't be merged no less than one day after they've been
  proposed, to make sure people have time to test them and think about all the
  possible implications they could have.
- Bug fixes can be merged without too much wait.
- New features or anything involving architecture discussions and design
  interactions should be reviewed and approved by the module owner.
- If a review takes more than a few days, it is appropriate to gently ping the
  reviewer(s). Note that they might be busy in meat space. Not getting a review
  isn't a reason to merge any time sooner.
- Failing to respect these rules may result in losing the right to merge, after
  a first warning strike and a discussion between contributors.

# Release process

## Publish on git

- Update the version number in the package.json file on the `master` branch.
- Checkout the `builds` branch and merge from `master` with `git checkout
  builds && git merge -X theirs master` (which will always take
  master changes).
- Run `make release`.
- Check `git status`, unstage unwanted changes, and commit with `Build;` in the
  commit message.
- Run `git tag 0.14.0` with the version number.
- Push the `builds` branch and the tag.

## Publish on npm

- Just after this on the same branch, run `npm publish`.
- Test npm release with `npm install --prefix /tmp kresus` and run Kresus from there.

## Publish on Docker hub

- Run `make docker-release` (ensure it doesn't use cached images).
- `docker tag bnjbvr/kresus:latest bnjbvr/kresus:0.14.0` with the right version
  number.
- `docker push bnjbvr/kresus`

## Website and demo

- Write a blog post for the release:
    - check commits.
    - don't talk too much about implementation details unless a lot of work has
      been done in a particular area, e.g. tests, migrating DB, etc.
    - give visibility to non-technical contributions too.
    - format the blog post so all images etc. are served locally
    - add Pelican metadata.
- Update the demo on demo.kresus.org with the docker image, make sure it still
  works.

## Extra communication

- Create social media messages for Mastodon / Twitter and publish them with a
  link to the blog post.
- Ideally, re-publish social media updates a few hours / days later.
- Let package maintainers know about the update, and try to give instructions
  to make it easier to ugprade their packages (ArchLinux / YNH).
