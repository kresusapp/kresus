# TL;DR

- Branch off `master`.
- One feature per commit.
- In case of changes request, amend your commit.

# How to hack on Kresus

- Install the app's dependencies:

```make install-node-dev-deps```

- Some files needs to be compiled to JS, prepared and moved around, etc. There
  are two ways to do this:
  - either manually after each big set of changes, using `make build`. This
    will do it once for all and you will need to retrigger it every single time
    you want to compile the files.
  - or automatically as you change the files, using `make dev`.

If watching doesn't work, under Unix based operating systems (Linux, MacOS),
you might need to [increase the number of inotify
nodes](https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit).

# About `package.json` file

We use `package.json` in a reproducible way, specifying the exact version to
use. Please make sure all version numbers are exact in `package.json`, thus
using no version ranges specifies like `~`, `>` etc.

# About branches

- `master` contains all changes in the current development version, including
  some experimental features that could break in production.
- `builds` contains a stable version of the code for releases.

# How to contribute

- If you're thinking about a new feature, see if there's already an issue open
  about it, or please open one otherwise. This will ensure that everybody is on
  track for the feature and willing to see it in Kresus.
- One commit per feature.
- Branch off the `master ` branch.
- Test your code with `make check`. This also runs linting and a few consistency
  checks.
- Ideally, your merge-request should be mergeable without any merge commit, that
  is, it should be a fast-forward merge. For this to happen, your code needs to
  be always rebased onto `master`. Again, this is something nice to have that
  I expect from recurring contributors, but not a big deal if you don't do it
  otherwise.
- I'll look at it and might ask for a few changes. In this case, please create
  new commits. When the final result looks good, I may ask you to squash the
  WIP commits into a single one, to maintain the invariant of "one feature, one
  commit".
