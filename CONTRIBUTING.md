# TL;DR

- Branch off `incoming`.
- One feature per commit.
- In case of changes request, amend your commit.

# How to hack on Kresus

- Install the app's dependencies:

```make install-node-deps```

- Some files needs to be compiled to JS, prepared and moved around, etc. There
  are two ways to do this:
  - either manually after each big set of changes, using `make build`. This
    will do it once for all and you will need to retrigger it every single time
    you want to compile the files.
  - or automatically as you change the files, using `make dev`.

If watching doesn't work, under Unix based operating systems (Linux, MacOS),
you might need to [increase the number of inotify
nodes](https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit).

# About branches

- `master` contains a stable version of the code for CozyCloud releases.
- `incoming` contains all changes in the current development version, including
  some experimental features that could break in production.

# How to contribute

- If you're thinking about a new feature, see if there's already an issue open
  about it, or please open one otherwise. This will ensure that everybody is on
  track for the feature and willing to see it in Kresus.
- One commit per feature.
- Branch off the `incoming` branch\*.
- Test your code with `make test`. This also runs linting and a few consistency
  checks.
- Ideally, your pull-request should be mergeable without any merge commit, that
  is, it should be a fast-forward merge. For this to happen, your code needs to
  be always rebased onto `incoming`. Again, this is something nice to have that
  I expect from recurring contributors, but not a big deal if you don't do it
  otherwise.
- I'll look at it and might ask for a few changes. In this case, please amend
  your commit, rather than creating new commits.

\*Unless on very special occasions (bug in production servers making it
impossible to use Kresus at all), all pull requests based on another branch are
very likely to be refused with a request to rebase onto `incoming` (unless they
can be fast-forward merged onto `incoming`).
