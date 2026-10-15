---
assurance:
  id: t-4
  base: sha256:728a87ec483aa90bf6da67fcb1dccfba48c40a9079b4c3303c55e8c3bae5a427
tags: [kresus, e2e]
code_export: true
code_language: javascript
variables:
  budget_amount:
    value: "150"
  budget_category:
    value: "Groceries"
  start_url:
    value: "http://localhost:9876/"
---
# Monthly category budget appears with its entered amount

> Set a monthly budget for a chosen category and check that the budgets page displays that category and the entered amount.

## Step 1

At {{start_url}}, open Kresus and reach its monthly category budget-setting flow.

## Step 2

In Kresus's monthly category budget-setting flow, set the monthly budget for category {{budget_category}} to {{budget_amount}}.

## Step 3 @verifies ac-7, ac-8

On Kresus's budgets page, locate the monthly budget for category {{budget_category}}, then assert the chosen category's monthly budget appears and its displayed amount equals the monthly budget amount entered for that category.
