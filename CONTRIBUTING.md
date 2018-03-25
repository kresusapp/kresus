This file describes how to contribute **code** to Kresus. Note that many other
contributions are valuable and would be glady accepted in all of the following
domains: design, user interface, user experience, translations, documentation,
tutorials. The only limit is the imagination!

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

- Please note that not every feature can make it into Kresus, because new
  features add a lot of complexity and make it harder to maintain the code.
- If you're thinking about a new feature, see if there's already an issue open
  about it, or open one otherwise. This will ensure that everybody is on track
  for the feature and willing to have it in Kresus.
- One commit per feature.
- Branch off the `master` branch. Rebase as often as possible.
- Test your code with `make check`. This also runs linting and a few
  consistency checks.
- Ideally, your merge request should be mergeable without any merge commit,
  that is, it should be a fast-forward merge. For this to happen, your code
  needs to be always rebased onto `master`. Again, this is something nice to
  have that we expect from recurring contributors, but not a big deal if you
  don't do it otherwise.
- We'll look at your MR and might ask for a few changes. In this case, please
  create new commits. When the final result looks good, we may ask you to
  squash the WIP commits into a single one, to maintain the invariant of "one
  feature, one commit".

# Core team

- Core contributors: `nicofrand`, `ZeHiro`, `Phyks`. Core contributors can
  review and merge MRs, and have full power on the repository, including but
  not limited to push access on the `master` branch.
- Benevolent dictator for life (BDFL): `bnjbvr` (if alive). He gets the last
  word and can veto the progression of a particular merge request, which should
  only happen in last resort if no cooperative solutions have been found
  otherwise.

# Review and merge rules

- More than one person must have the commit accesses on `master`.
- All code changes must pass through the process of review. As a matter of
  fact, it is not allowed to push directly on the `master` branch. All changes
  must go through a merge request.
- All merge requests must be reviewed and approved by at least one core
  contributor before they can be considered for a merge. The marking of a merge
  request with the `shipit` label indicates that a merge request can be merged
  by the author, once the remaining issues / remarks have been addressed; of
  course, if other questions arise, the author can ask for another round of
  review (and unmark the MR as `shipit`).
- Merge requests shouldn't be merged no less than one day after they've been
  proposed, to make sure people have time to test them and think about all the
  possible implications they could have.
- Bug fixes can be merged without too much wait.
- New features or anything involving architecture discussions and design
  interactions should be reviewed and approved by the BDFL.
- If a review takes more than a few days, it is appropriate to gently ping the
  reviewer(s). Note that they might be busy in meat space. Not getting a review
  isn't a reason to merge any time sooner.
- Merge commits are despised, because they introduce commits that have no value
  (not meaningful changes) and make bisecting harder. As a result, merge
  requests should be locally pulled, rebased if needed and pushed by hand. This
  could change once [Gitlab allows rebase-and-push in
  CE](https://gitlab.com/gitlab-org/gitlab-ce/issues/20076).
- Failing to respect these rules may result in losing the right to merge, after
  a first warning strike and a discussion between contributors.
