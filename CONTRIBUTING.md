This file describes how to contribute **code** to Kresus. Note that many other contributions are
valuable (design, UI, UX, translations, docs, tutorials, etc.) and would be glady accepted! If you
want to get started with those, please head to our [community forum](https://community.kresus.org)
or our [Matrix chat](https://matrix.to/#/#kresus:delire.party).

# TL;DR

- If you're thinking about a new feature, please make sure to discuss it with the core team, either
  in issues or in chat. Not every feature can make it into Kresus, as it adds a maintenance burden
  to the core team.
- Run all CI tests/lints with `yarn ci`.
- Strive to keep commits small and atomic, ideally, to ease review.
- In case of requests for changes, prefer `fixup!` commits to make review easier, and squash them
  before merging.

# Development environment

- First, install the app's dependencies:
```bash
yarn install
```
- Copy `config.example.ini` to `config.ini` and set values for your local
  development environment. See "setting up a database for development" below.
- Start development mode: `yarn dev`. This will:
  - automatically build the server and client files,
  - spawn the main server on localhost:9876 (and reload it whenever a server source file is changed)

If dev mode doesn't work, under Unix based operating systems (Linux, MacOS),
you might need to [increase the number of inotify
nodes](https://confluence.jetbrains.com/display/IDEADEV/Inotify+Watches+Limit).

## Setting up a database for development

In the `config.ini` file, you can set up a sqlite database quickly with the
following database configuration:

    [db]
    type=sqlite
    sqlite_path=/tmp/dev.sqlite

It is important that Postgres support be properly maintained too, so it is recommended to try
changes with Postgres before submitting the MR. It is possible to set up a Docker instance of
Postgres with the following command line:

```bash
docker run --rm --name kresus-postgres -p 5432:5432 -e POSTGRES_PASSWORD=kresusdev postgres
```

And then you can use the following settings in the configuration file:

    [db]
    type=postgres
    host=localhost
    port=5432
    username=postgres
    name=postgres
    password=kresusdev

# Running tests

A series of tests are shipped with the code to avoid regressions. They are
located in the `./tests` folder.
Some tests require a valid install of Woob to work properly, some others do not.
For that, the woob related tests are disabled if the environment variable
`KRESUS_WOOB_DIR` is not set. Some other tests are disabled if this
environment variable is set.
To ensure all the tests pass, you need to run the test command twice, once with
`KRESUS_WOOB_DIR` set, once without. For example:

```bash
yarn ci:test
KRESUS_WOOB_DIR=/path/to/woob yarn ci:test
```

# Common procedures

## Bumping the node.js version

When bumping the node.js version, make sure to update it in all the following places:

- in `package.json`, in the `engines` field,
- in the `Dockerfile`s, in the `FROM` lines,
- in the CI configuration, in the `.gitlab-ci.yml` file, in the `default` `image` field.

# Misc

## About branches/tags

- `main` contains all changes in the current development version, including
  some experimental features that could break in production.
- `builds` contains stabler versions of the code for releases.
- tags are based off commits from the `builds` branch, and they're used as the basis for `npm` and
  `docker` builds.

## Core team

- Core contributors: `nicofrand`, `bnjbvr`. Core contributors can review and merge MRs, and have
  full power on the repository, including but not limited to push access on the `main` branch.
- Thanks to our past core contributors: `ZeHiro`, `Phyks` for all their work!
