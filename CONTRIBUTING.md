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

- (Optional, but recommended) Install the git hooks shipped in
  `support/githooks`, so that formatting automatically happens upon commit:

```bash
yarn dev:githooks
```

Note that it points git at `support/githooks` instead of the default
`.git/hooks` directory, so any hook you had put in there will no longer run.
Alternatively, you can pick individual hooks from `support/githooks/` that you
like.

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

## Testing email support

You can use a `mailcatcher` Docker instance to test the email support. The service spawns a small
SMTP server that will catch and show emails in a neat Web interface accessible on localhost:1080.

```bash
docker run -ti --rm -p 1080:1080 -p 1025:1025 dockage/mailcatcher
```

In Kresus' `config.ini` file, you can set the following configuration options:

```ini
[email]
transport=smtp
from=kresus@localhost.tld
host=localhost
port=1025
```

And finally, after starting the Kresus server locally, you can set any recipient email address in
the email settings.

# Misc

## AI Policy

Kresus intends to provide a safe piece of software that users can trust, especially as it processes
sensitive personal data. To this end, many design decisions and writing the code itself require
meticulous consideration.

Our stance on generative AI contributions for Kresus is to generally **disallow** its use for
development of the core features (any code in the bin/, client/, server/, shared/ directories) or
generation of text that will be read by other humans (comments, issues, pull requests,
documentation, etc.).

We have the following exceptions to the rule:

- Diagnosis and reporting of bugs or security vulnerabilities
- Use for integration or unit tests (in tests/).
- Utilities and tooling (in scripts/).
- Repository CI (in .forgejo/).
- Help translating from your native language to English.
- Help understanding the code base better.

**Usage of AI must be disclosed in pull requests**, following our template:

- Type of assistance: Code generation, documentation, debugging, testing, refactoring, etc.
- Scope of usage: which files, functions, or sections were AI-assisted
- Tool(s) used: Name of the AI system(s) employed (e.g., GitHub Copilot, ChatGPT, etc.)
- Level of modification: whether AI-generated content was used as-is, modified, reviewed, or used
  as inspiration.

The Kresus maintainers reserve the right to close any issue/pull request that does not meet the
standards of this policy.

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
