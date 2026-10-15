---
assurance:
  id: t-1
  base: sha256:dd098a85fdf580b903c4a8c9609a5fb208eeafd1b37b4c93537de6a31c6c48e3
tags: [kresus, e2e]
code_export: true
code_language: javascript
variables:
  start_url:
    value: "http://localhost:9876/"
---
# Fresh Kresus instance lists Demo bank and its accounts

> On a fresh instance, observe active demo mode and the Demo bank access listed together with its accounts.

## Step 1 @verifies ac-1

At {{start_url}}, open a fresh Kresus instance and inspect its demo-mode state, then assert demo mode is active.

## Step 2 @verifies ac-2, ac-3

On the fresh Kresus instance, inspect the bank-access listing for the "Demo bank" access and its associated accounts, then assert the "Demo bank" access is listed and its accounts are listed with it.
