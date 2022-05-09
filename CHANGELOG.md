## 0.18 (unreleased)

- The balance now always matches the one from the bank (instead of being computed from all the transactions)
- Ability to use nss instead of openssl (useful for some banks that use weak DH keys)
- Account information are now on their own page
- Charts now all use the same rendering engine
- Charts: balance charts now display negative values in a different color
- Manual transactions labels are now used as custom label when merging two transactions
- Ability to limit ongoing's sum to the current month
- UX improvements (more success notifications, simplification of threshold of transactions to be fetched, better explanations of some actions…)
- Updates in woob modules:
    - Deprecated support for `netfinca`
    - Added support for `allianzbanque`, authentication types for `btpbanque` / `creditcoop`, `federalfinancees`, `ganpatrimoine`, `helios`

Fixes:

- Disabled accesses can now be deleted
- Inputs not allowing `0` values

