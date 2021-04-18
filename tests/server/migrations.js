import should from 'should';

import { Budget, Category, User } from '../../server/models';
import { RemoveDuplicateBudgets1608817776804 as BudgetsDuplicatesRemoval } from '../../server/models/migrations/7';
import { UniqueBudget1608817798703 as BudgetsConstraintMigration } from '../../server/models/migrations/8';

async function cleanAll(userId) {
    await Budget.destroyAll(userId);
    await Category.destroyAll(userId);
}

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.user.id which
    // might have been clobbered by another test.
    // TODO: this is bad for testing and we should fix this properly later.
    const users = await User.all();
    if (!users.length) {
        throw new Error('user should have been created!');
    }
    USER_ID = users[0].id;
    if (typeof USER_ID !== 'number') {
        throw new Error('missing user id in test.');
    }
});

describe('migrations', () => {
    before(async () => {
        await cleanAll(USER_ID);
    });

    it('reverting migration 8 should remove unique constraint properly', async () => {
        const connection = Budget.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        let table = await queryRunner.getTable('budget');
        const numberOfConstraints = table.uniques.length;
        numberOfConstraints.should.aboveOrEqual(1);

        const constraintMigration = new BudgetsConstraintMigration();
        await constraintMigration.down(queryRunner);

        table = await queryRunner.getTable('budget');
        table.uniques.length.should.equal(numberOfConstraints - 1);
    });

    it('should run migration 7 (removing budgets duplicates) properly', async () => {
        await Category.create(USER_ID, {
            label: 'Dummy category',
            color: '#1b9d68',
            id: 0,
        });
        const allCategories = await Category.all(USER_ID);
        allCategories.length.should.equal(1);

        // Drop unique constraint first
        const connection = Budget.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        const constraintMigration = new BudgetsConstraintMigration();
        await constraintMigration.down(queryRunner);

        // Then create budgets duplicates
        const budget = {
            userId: USER_ID,
            year: 2021,
            month: 4,
            categoryId: 0,
        };
        await Budget.create(USER_ID, budget);
        await Budget.create(USER_ID, budget);

        let allBudgets = await Budget.all(USER_ID);
        allBudgets.length.should.equal(2);

        // Then run the migration
        const duplicatesRemoval = new BudgetsDuplicatesRemoval();
        await duplicatesRemoval.up(queryRunner);

        // Restore the unique constraint
        await constraintMigration.up(queryRunner);

        allBudgets = await Budget.all(USER_ID);
        allBudgets.length.should.equal(1);
    });
});
