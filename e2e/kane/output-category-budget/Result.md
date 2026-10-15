---
test: ../category-budget_test.md
status: passed
started: 2026-10-15T13:02:00.378Z
duration_s: 94
session_id: 2a9dbeb6-3d23-4e93-9a3e-6128b5d9a239
---

# Monthly category budget appears with its entered amount — Result

## Step 1 ✓ passed (1.93s)
md5: bce4a2ada787e6960f2b223b6ef0fe98
At {{start_url}}, open Kresus and reach its monthly category budget-setting flow.

## Step 2 ✓ passed (11.59s)
md5: 3567b3cf82d0019659745ba548a2026b
In Kresus's monthly category budget-setting flow, set the monthly budget for category {{budget_category}} to {{budget_amount}}.

## Step 3 ✓ passed (43.9s)
md5: 4d6c753e289b0b0630a82f0e155edff9
On Kresus's budgets page, locate the monthly budget for category {{budget_category}}, then assert the chosen category's monthly budget appears and its displayed amount equals the monthly budget amount entered for that category.
