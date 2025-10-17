import should from 'should';
import { QueryFailedError } from 'typeorm';
import { Access, Budget, Category, View } from '../../server/models';
import { importData } from '../../server/controllers/all';

describe('Budgets model API', () => {
    const world = {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: 'whatever-manual-acc--does-not-care',
                customLabel: 'Optional custom label',
            },
        ],

        accounts: [
            {
                id: 0,
                accessId: 0,
                vendorAccountId: 'manualaccount-randomid',
                type: 'account-type.checking',
                initialBalance: 0,
                label: 'Compte Courant',
                iban: 'FR4830066645148131544778523',
                currency: 'EUR',
                importDate: new Date('2019-01-01:00:00.000Z'),
            },
        ],
    };

    let USER_ID = null;
    before(async () => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.user.id;

        await importData(USER_ID, world);
    });

    after(async () => {
        await Access.destroyAll(USER_ID);
    });

    describe('Duplicates management', () => {
        it('Creating the same budget should raise', async () => {
            const category = await Category.create(USER_ID, { label: 'A label', color: '#000000' });

            // There already exists an account, and by extension, a view.
            const views = await View.all(USER_ID);
            views.length.should.equal(1);

            const dummyBudget = {
                categoryId: category.id,
                viewId: views[0].id,
                year: 2020,
                month: 12,
                threshold: 100,
            };

            await Budget.create(USER_ID, dummyBudget);
            await Budget.create(USER_ID, dummyBudget).should.be.rejectedWith(QueryFailedError);
        });
    });

    describe('replaceForCategory', () => {
        beforeEach(async () => {
            await Budget.destroyAll(USER_ID);
            await Category.destroyAll(USER_ID);
        });

        it('should work properly when there is no budget for the replacement category', async () => {
            const categoryA = await Category.create(USER_ID, {
                label: 'A label',
                color: '#000000',
            });
            const categoryB = await Category.create(USER_ID, {
                label: 'B label',
                color: '#FFFFFF',
            });

            // There already exists an account, and by extension, a view.
            const views = await View.all(USER_ID);
            views.length.should.equal(1);

            const dummyBudget = {
                categoryId: categoryA.id,
                viewId: views[0].id,
                year: 2020,
                month: 12,
                threshold: 100,
            };

            const created = await Budget.create(USER_ID, dummyBudget);
            await Budget.replaceForCategory(USER_ID, categoryA.id, categoryB.id);

            const replaced = await Budget.find(USER_ID, created.id);
            replaced.categoryId.should.equal(categoryB.id);
        });

        it('should do nothing when there already exists a budget with threshold for the replacement category', async () => {
            const categoryA = await Category.create(USER_ID, {
                label: 'A label',
                color: '#000000',
            });
            const categoryB = await Category.create(USER_ID, {
                label: 'B label',
                color: '#FFFFFF',
            });

            // There already exists an account, and by extension, a view.
            const views = await View.all(USER_ID);
            views.length.should.equal(1);

            const dummyBudgetCatA = {
                categoryId: categoryA.id,
                viewId: views[0].id,
                year: 2020,
                month: 12,
                threshold: 100,
            };

            const dummyBudgetCatB = {
                ...dummyBudgetCatA,
                categoryId: categoryB.id,
                threshold: 50,
            };

            const createdA = await Budget.create(USER_ID, dummyBudgetCatA);
            const createdB = await Budget.create(USER_ID, dummyBudgetCatB);
            await Budget.replaceForCategory(USER_ID, categoryA.id, categoryB.id);

            const unchangedA = await Budget.find(USER_ID, createdA.id);
            unchangedA.categoryId.should.equal(categoryA.id);
            unchangedA.threshold.should.equal(dummyBudgetCatA.threshold);

            const unchangedB = await Budget.find(USER_ID, createdB.id);
            unchangedB.categoryId.should.equal(categoryB.id);
            unchangedB.threshold.should.equal(dummyBudgetCatB.threshold);
        });

        it('should work properly when there already exists a budget for the replacement category and the replacement has no threshold', async () => {
            const categoryA = await Category.create(USER_ID, {
                label: 'A label',
                color: '#000000',
            });
            const categoryB = await Category.create(USER_ID, {
                label: 'B label',
                color: '#FFFFFF',
            });

            // There already exists an account, and by extension, a view.
            const views = await View.all(USER_ID);
            views.length.should.equal(1);

            const dummyBudgetCatA = {
                categoryId: categoryA.id,
                viewId: views[0].id,
                year: 2020,
                month: 12,
                threshold: 150,
            };

            const dummyBudgetCatB = {
                ...dummyBudgetCatA,
                categoryId: categoryB.id,
                threshold: 0,
            };

            await Budget.create(USER_ID, dummyBudgetCatA);
            const createdB = await Budget.create(USER_ID, dummyBudgetCatB);
            await Budget.replaceForCategory(USER_ID, categoryA.id, categoryB.id);

            const existingB = await Budget.find(USER_ID, createdB.id);
            existingB.categoryId.should.equal(categoryB.id);
            existingB.threshold.should.equal(dummyBudgetCatA.threshold);
        });
    });
});
