---
assurance:
  id: t-2
  base: sha256:cb802eac0adecb726ae3a775e1bec8ca72543d746eb449874bd13b914dda9281
tags: [kresus, e2e]
code_export: true
code_language: javascript
variables:
  start_url:
    value: "http://localhost:9876/"
---
# Assigned category appears on demo checking transaction row

> In the demo checking account assign an available category to one transaction and observe that category on its row.

## Step 1

At {{start_url}}, open the Kresus web instance and reach the demo checking account's transaction list.

## Step 2 @verifies ac-4

In the demo checking account's transaction list, choose one transaction and assign one available category to it, remembering the selected category label; then assert the same transaction's row displays that selected category.
