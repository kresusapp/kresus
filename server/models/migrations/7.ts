import { MigrationInterface, QueryRunner } from 'typeorm';
import { bulkDelete } from '../helpers';
import { Budget } from '..';

// This cannot be run as a data migration, because data migrations are run after the import, and the
// unique constraint might be present before the data has been imported, which would cause errors
// during the import, so that has to be manually handled when importing.

export class RemoveDuplicateBudgets1608817776804 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        const allBudgets = await q.manager.find(Budget, {
            select: ['id', 'userId', 'year', 'month', 'categoryId'],
        });

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
            await bulkDelete(q.manager.getRepository(Budget), budgetIdsToDelete);
        }
    }

    public async down(): Promise<void> {
        // Do nothing.
    }
}
