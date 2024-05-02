## Unreleased

### Bug fixes

- The order of data is now correct again in the earnings chart (before it was inverted with respect
  to the labels, see also #1245).
- Planned transactions in balance charts showed incorrect values (see #1248). Values are now correct and displayed with a dashed line to distinct them from actual transactions.

### New features and changes

- Email reports and automated alerts will show a transaction's custom label, if it is set (#1230).
- Accounts that can't be found anymore on a bank's website will now get a special mention of that
  in their edit page.
- ... and it's now possible to set the balance manually for those accounts.
- Recurring transactions are now sorted by day of month
- On failure transactions or accounts polls are now automatically retried a few times, in case the remote server dropped the connection
- On mobile the reports rows are now swipable: swipe to the right to open the details (this replaces the longpress action) and to the left to delete a transaction.


### Breaking

### Bank support

- Deprecated: ticketscesu (Tickets CESU Edenred). It may be reenabled in a future release of
  Kresus, depending on changes in Woob.

## 0.20.1

### Bug fixes

- Balance charts: placeholder always displayed
- Charts placeholder too large on narrow screens
- Transaction details: pressing enter triggers navigation to transactions rules screen

## 0.20.0

### New features and changes

- Onboarding shows more obviously it's possible to use manual accounts with Kresus.
- Recurring transactions are now available from the lateral menu.
- One can now set the balance of accounts in disabled accesses.
- OFX files can now be imported on an existing access
- Accounts from a same access can now be merged
- The amounts inputs now display a better keyboard on mobile (numeric keys only)
- Ibans can be copied into clipboard

### Bug fixes

- When no apprise URL is set and an alert is defined, a sync request can fail.

### Breaking

- Changed license to the AGPLv3-and-future.
- API: Renamed "operation" to "transaction" everywhere in the code base, including API endpoints
  and data contained in those endpoints. There is backward compatibility with old import files that
  contained fields with "operation" in their names.
- Woob minimal version is now 3.5.
- Remove deprecated nss support

## 0.19.4

The build of 0.19.3 did not actually include all mentioned fixes, resulting in a npm package
still containing bugs preceding 0.19.3.

This tag only fixes it, there is no additional fix nor feature.

## 0.19.3

### Bug fixes

- Fix broken export when there are rules with condition type "amount_equals"

## 0.19.2 (released on 2023-02-28)

### Bug fixes

- Fix api path for recurring transactions (bis)

## 0.19.1 (released on 2023-02-28)

### Bug fixes

- Fix api path for recurring transactions (only working on root directory)
- Fix recurring transactions creation disabled in account screen in demo mode

## 0.19.0 (released on 2023-02-22)

### New features and changes

- A transaction can now be used as a template for a new auto-categorization
  rule (in the detailed transaction view).
- It's possible to update the date for transactions manually created by users.
- Auto-categorization rules can now have a condition based on an exact
  transaction's amount
- The currency can now be specified when creating a manual bank access
- Implementation of recurring transactions: transactions that will automatically
  be created each month
- Budgets: progress bar is now clickable on mobile as a shortcut to reports
- UI improvements (dark skin improvements for notifications, cleaner balance charts)
- Charts by category: clicking a category on any chart will select/deselect it for all the charts

### Internal changes

- Remove vendorId from Account table and rely on accessId
- Update dependencies

### Bug fixes

- Fix ongoing not re-computed on transaction's date modification

### Breaking

- Woob minimal version is now 3.1
- Node minimal version is now 16

## 0.18.1 (released on 2022-06-14)

### Bug fixes

- Fix bnporc & cmmc banks migrations
- Fix end of month dates (used in ongoing computation for ex.), sometimes shifted by a month
- Add some missing python & docker dependencies

## 0.18 (released on 2022-05-21)

- The balance now always matches the one from the bank (instead of being computed from all the transactions)
- Ability to use nss instead of openssl (useful for some banks that use weak DH keys)
- Account information are now on their own page
- Charts now all use the same rendering engine
- Charts: balance charts now display negative values in a different color
- Manual transactions labels are now used as custom label when merging two transactions
- Ability to limit ongoing's sum to the current month
- UX improvements (more success notifications, simplification of threshold of transactions to be fetched, better explanations of some actions…)
- Updates in woob modules:
    - Deprecated support for `netfinca`, `paypal`
    - Added support for `lita`, `primonial reim`, `allianzbanque`, `federalfinancees`, `ganpatrimoine`, `helios`, authentication types for `btpbanque` / `creditcoop`

Fixes:

- Disabled accesses can now be deleted
- Inputs not allowing `0` values

Internal:

- replaced Webpack build system with Vite
- replaced janitor cloud dev support with gitpod
