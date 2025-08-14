"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveDuplicateBudgets1608817776804 = void 0;
const helpers_1 = require("../helpers");
const __1 = require("..");
// This cannot be run as a data migration, because data migrations are run after the import, and the
// unique constraint might be present before the data has been imported, which would cause errors
// during the import, so that has to be manually handled when importing.
class RemoveDuplicateBudgets1608817776804 {
    async up(q) {
        const allBudgets = await q.manager.find(__1.Budget, {
            select: ['id', 'userId', 'year', 'month', 'categoryId'],
        });
        const setOfUniqueBudgetKeys = new Set();
        const budgetIdsToDelete = [];
        // Identify duplicate budget entries.
        for (const budget of allBudgets) {
            // The key to identify a budget uniquely.
            const key = `${budget.userId}-${budget.year}-${budget.month}-${budget.categoryId}`;
            if (setOfUniqueBudgetKeys.has(key)) {
                budgetIdsToDelete.push(budget.id);
            }
            else {
                setOfUniqueBudgetKeys.add(key);
            }
        }
        // Delete the duplicate entries.
        if (budgetIdsToDelete.length) {
            await (0, helpers_1.bulkDelete)(q.manager.getRepository(__1.Budget), budgetIdsToDelete);
        }
    }
    async down() {
        // Do nothing.
    }
}
exports.RemoveDuplicateBudgets1608817776804 = RemoveDuplicateBudgets1608817776804;
