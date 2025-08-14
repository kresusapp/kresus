import should from 'should';

import { Access, Account, Budget, Category, User, Transaction } from '../../server/models';
import { RemoveDuplicateBudgets1608817776804 as BudgetsDuplicatesRemoval } from '../../server/models/migrations/7';
import { UniqueBudget1608817798703 as BudgetsConstraintMigration } from '../../server/models/migrations/8';
import { SetDefaultBalance1648536789093 as SetDefaultBalance } from '../../server/models/migrations/13';
import { AddViews1734262035140 as AddViewsMigration } from '../../server/models/migrations/23';
import { AddIsAdminInUser1741675783114 as AddIsAdminUser } from '../../server/models/migrations/24';
import { AddViewIdInBudget1737381056464 as AddViewIdInBudgetMigration } from '../../server/models/migrations/25';

async function cleanAll(userId) {
    await Budget.destroyAll(userId);
    await Category.destroyAll(userId);
}

let USER_ID = null;
before(async () => {
    // Reload the USER_ID from the database, since process.kresus.defaultUser.id which
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

    // Run before test on migration 8 since they both touch unique constraints.
    it('reverting migration 25 should remove unique constraint properly', async () => {
        const connection = Budget.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        let table = await queryRunner.getTable('budget');
        table.uniques.length.should.equal(1);
        should(table.uniques[0].columnNames.includes('viewId')).be.true();

        // There is a unique constraint but the columnNames do not include 'viewId' anymore.
        const constraintMigration = new AddViewIdInBudgetMigration();
        await constraintMigration.down(queryRunner);

        table = await queryRunner.getTable('budget');
        table.uniques.length.should.equal(1);
        should(table.uniques[0].columnNames.includes('viewId')).be.false();
    });

    // Run before test on migration 7 (we need the unique constraint removed before faking duplicates).
    it('reverting migration 8 should remove unique constraint properly', async () => {
        const connection = Budget.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        let table = await queryRunner.getTable('budget');
        should(table.uniques.length).equal(1);

        const constraintMigration = new BudgetsConstraintMigration();
        await constraintMigration.down(queryRunner);

        table = await queryRunner.getTable('budget');
        should(table.uniques.length).equal(0);
    });

    it('should run migration 7 (removing budgets duplicates) properly', async () => {
        // First create the associated category
        await Category.create(USER_ID, {
            label: 'Dummy category',
            color: '#1b9d68',
            id: 0,
        });
        const allCategories = await Category.all(USER_ID);
        allCategories.length.should.equal(1);

        // Then an account, that will create an associated view, mandatory since migration 24.
        const someAccess = await Access.create(USER_ID, {
            login: 'login',
            password: 'password',
            vendorId: 'whatever',
        });

        await Account.create(USER_ID, {
            accessId: someAccess.id,
            vendorAccountId: 111111,
            label: 'Some account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        // Drop migration 25 'viewId' column & migration 8 unique constraint first.
        const connection = Budget.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        const migration25ConstraintMigration = new AddViewIdInBudgetMigration();
        try {
            await migration25ConstraintMigration.down(queryRunner);
            // eslint-disable-next-line
        } catch (ignore) {}

        const migration8ConstraintMigration = new BudgetsConstraintMigration();
        await migration8ConstraintMigration.down(queryRunner);

        // Then create budgets duplicates
        // We can't use `Budget.create` due to migration 25 adding the viewId column, which is still
        // unknown at this point, but present in the model file.
        await queryRunner.manager.query(`INSERT INTO budget(userId, year, month, categoryId) VALUES
            (${USER_ID}, 2021, 4, 0),
            (${USER_ID}, 2021, 4, 0)
        `);

        let allBudgets = await queryRunner.manager.find(Budget, {
            select: ['id'],
            where: {
                userId: USER_ID,
            },
        });
        allBudgets.length.should.equal(2);

        // Then run the migration
        const duplicatesRemoval = new BudgetsDuplicatesRemoval();
        await duplicatesRemoval.up(queryRunner);

        // Restore the constraints
        await migration8ConstraintMigration.up(queryRunner);

        allBudgets = await queryRunner.manager.find(Budget, {
            select: ['id'],
            where: {
                userId: USER_ID,
            },
        });
        allBudgets.length.should.equal(1);
    });

    it('should run migration 13 (setting default bank accounts balance) properly', async () => {
        const manualAccess = await Access.create(USER_ID, {
            login: 'login',
            password: 'password',
            vendorId: 'manual',
        });

        const manualAccount = await Account.create(USER_ID, {
            accessId: manualAccess.id,
            vendorAccountId: 111111,
            label: 'Manual account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        const classicAccess = await Access.create(USER_ID, {
            login: 'login',
            password: 'password',
            vendorId: 'whatever',
        });

        const classicAccount = await Account.create(USER_ID, {
            accessId: classicAccess.id,
            vendorAccountId: 111111,
            label: 'Classic account',
            initialBalance: 500,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        await Transaction.create(USER_ID, {
            accountId: classicAccount.id,
            type: 'type.card',
            label: 'Wholemart',
            rawLabel: 'card 07/07/2019 wholemart',
            date: new Date('2019-07-07T00:00:00.000Z'),
            importDate: new Date('2019-01-01:00:00.000Z'),
            amount: -123.5,
        });

        const connection = Budget.repo().manager.connection;
        const balanceReset = new SetDefaultBalance();
        const queryRunner = connection.createQueryRunner();
        await balanceReset.up(queryRunner);

        // Don't use Account.find, which takes care of computing the balance if missing.

        // For manual accounts the balance should be null
        let account = await Account.repo().findOne({
            where: { userId: USER_ID, id: manualAccount.id },
        });
        should(account.balance).be.null();

        // For other accounts it should be initialBalance minus the sum of transactions
        account = await Account.repo().findOne({
            where: { userId: USER_ID, id: classicAccount.id },
        });
        account.balance.should.equal(376.5);
    });

    it('should run migration 23 and create views for existing accounts', async () => {
        const connection = Account.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        // Clean up tables if needed
        await queryRunner.query('DELETE FROM "view-accounts"');
        await queryRunner.query('DELETE FROM "view"');

        // Create an account to ensure at least one exists
        const someAccess = await Access.create(USER_ID, {
            login: 'login',
            password: 'password',
            vendorId: 'whatever',
        });

        const account = await Account.create(USER_ID, {
            accessId: someAccess.id,
            vendorAccountId: 123456,
            label: 'Test account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
        });

        // Run migration 23
        const migration = new AddViewsMigration();

        // Revert it first
        await migration.down(queryRunner);

        // Then apply it again
        await migration.up(queryRunner);

        // Check that at least one view exists
        const views = await queryRunner.query('SELECT * FROM "view" WHERE "userId" = $1', [
            USER_ID,
        ]);
        views.length.should.be.above(0);

        // Check that the view-accounts link exists
        const viewAccounts = await queryRunner.query(
            'SELECT * FROM "view-accounts" WHERE "accountId" = $1',
            [account.id]
        );
        viewAccounts.length.should.be.above(0);
    });

    it('should run migration 24 (adding isAdmin field to user model & set current users as admin) properly', async () => {
        let allUsers = await User.all();
        allUsers.length.should.equal(1);

        // Drop unique constraint first
        const connection = User.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        // Revert it first
        const newColMigration = new AddIsAdminUser();
        await newColMigration.down(queryRunner);

        // Then apply it again
        await newColMigration.up(queryRunner);

        allUsers = await User.all();
        allUsers.length.should.equal(1);
    });

    it('should run migration 25 and guess the best account on which to migrate budgets', async () => {
        const connection = User.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        const someAccess = await Access.create(USER_ID, {
            login: 'login',
            password: 'password',
            vendorId: 'whatever',
        });

        // First with account but none of type 'account-type.savings'.
        const savingAccount = await Account.create(USER_ID, {
            accessId: someAccess.id,
            vendorAccountId: 111111,
            label: 'Some saving account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
            type: 'account-type.savings',
        });

        await Account.create(USER_ID, {
            accessId: someAccess.id,
            vendorAccountId: 222222,
            label: 'Some card account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
            type: 'account-type.card',
        });

        let bestGuessAccountId = await AddViewIdInBudgetMigration.guessDefaultAccount(
            queryRunner,
            USER_ID
        );

        // Should return the first account.
        bestGuessAccountId.should.equal(savingAccount.id);

        // Now create a checking account
        const checkingAccount = await Account.create(USER_ID, {
            accessId: someAccess.id,
            vendorAccountId: 333333,
            label: 'Some checking account',
            initialBalance: 0,
            importDate: new Date(),
            lastCheckDate: 0,
            type: 'account-type.checking',
        });

        bestGuessAccountId = await AddViewIdInBudgetMigration.guessDefaultAccount(
            queryRunner,
            USER_ID
        );

        bestGuessAccountId.should.equal(checkingAccount.id);
    });

    it('should run migration 25 without throwing where there are no accounts', async () => {
        await Access.destroyAll(USER_ID);

        const connection = User.repo().manager.connection;
        const queryRunner = connection.createQueryRunner();

        const bestGuessId = await AddViewIdInBudgetMigration.guessDefaultAccount(
            queryRunner,
            USER_ID
        );
        // eslint-disable-next-line new-cap
        bestGuessId.should.equal(-1);
    });
});
