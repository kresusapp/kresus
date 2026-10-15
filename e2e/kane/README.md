# End-to-end tests (Kane CLI)

Browser tests for the demo-mode flows, written as plain-English `_test.md`
files for [Kane CLI](https://www.testmuai.com/kane-cli/). Each test has a
recorded run under `output-<test>/` so later runs replay the recording, plus an
exported Playwright (JavaScript) version of the same steps.

| Test | What it checks |
|---|---|
| `demo-accounts_test.md` | A fresh instance is in demo mode and lists the "Demo bank" access with its accounts |
| `categorize-transaction_test.md` | Assigning a category to a transaction of the demo checking account shows it on that row |
| `category-budget_test.md` | Setting a monthly budget for a category shows that amount on the budgets page |

The tests cite `requirements/kresus-e2e.md` style flows and need no account or
bank credentials: they rely on `KRESUS_FORCE_DEMO_MODE`, which seeds a fake
"Demo bank" on an empty database.

## 1. Boot Kresus in demo mode on a throwaway database

Build the client and server once, then start the server with forced demo mode
and a fresh SQLite file. With `NODE_ENV` unset, Kresus listens on port 9876,
which is the URL the tests use.

```bash
yarn build

KRESUS_FORCE_DEMO_MODE=true \
KRESUS_DB_TYPE=sqlite \
KRESUS_DB_SQLITE_PATH="$(mktemp -d)/kresus.sqlite" \
KRESUS_DIR="$(mktemp -d)" \
node bin/kresus.js
```

Open http://localhost:9876/ to confirm the Demo bank is listed. The tests change data
(a category assignment and a budget), so start from a fresh database file for
each run: delete the SQLite file and restart the server.

## 2. Run the tests

Install Kane CLI once and sign in (`npm install -g @testmuai/kane-cli`, then
`kane-cli login`). From the repository root:

```bash
kane-cli testrun run e2e/kane/*_test.md < /dev/null
```

Add `--headless` to run without a visible browser. A single test can be run
with `kane-cli testmd run e2e/kane/<name>_test.md`.

Steps replay from the recordings in `output-<test>/`; if a step's text is
edited, that step and the ones after it are re-recorded on the next run.

## 3. Exported Playwright code

Each `output-<test>/` folder also holds the exported Playwright (JavaScript)
version of the test, generated from the recording. It is a reference export,
not wired into `yarn test`.
