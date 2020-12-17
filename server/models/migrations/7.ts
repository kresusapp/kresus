import { MigrationInterface, QueryRunner } from 'typeorm';
import { Budget } from '..';

export class RemoveDuplicateBudgets1608817776804 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        const allBudgets = await q.manager.find(Budget);

        const setOfUniqueBudgetKeys = new Set<string>();
        const budgetIdsToDelete: number[] = [];

        // Identify duplicate budget entries.
        for (const budget of allBudgets) {
            // The key to identify a budget uniquely.
            const key = `${budget.userId}-${budget.year}-${budget.month}-${budget.categoryId}`;
            if (setOfUniqueBudgetKeys.has(key)) {
                budgetIdsToDelete.push(budget.id);
            } else {
                setOfUniqueBudgetKeys.add(key);
            }
        }

        // Delete the duplicate entries.
        if (budgetIdsToDelete.length) {
            await q.manager.delete(Budget, budgetIdsToDelete);
        }
    }

    public async down(): Promise<void> {
        // Do nothing.
    }
}
