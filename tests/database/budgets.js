import should from 'should';
import { QueryFailedError } from 'typeorm';
import { Budget, Category, View } from '../../server/models';

describe('Duplicate budgets', () => {
    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.user.id;
    });

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
