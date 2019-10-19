import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne
} from 'typeorm';

import User from './users';
import Category from './categories';

import { makeLogger } from '../../helpers';
import { ForceNumericColumn } from '../helpers';

let log = makeLogger('models/entities/budget');

@Entity()
export default class Budget {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => Category, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    category;

    @Column('integer')
    categoryId;

    // Threshold used in the budget section, defined by the user.
    @Column('numeric', { nullable: true, transformer: new ForceNumericColumn() })
    threshold;

    // Year.
    @Column('int')
    year;

    // Month.
    @Column('int')
    month;
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(Budget);
    }
    return REPO;
}

Budget.all = async function(userId) {
    return await repo().find({ userId });
};

Budget.create = async function(userId, attributes) {
    let entity = repo().create({ userId, ...attributes });
    return await repo().save(entity);
};

Budget.destroy = async function(userId, budgetId) {
    return await repo().delete({ id: budgetId, userId });
};

Budget.byCategory = async function(userId, categoryId) {
    if (typeof categoryId !== 'number') {
        log.warn(`Budget.byCategory API misuse: ${categoryId}`);
    }
    return await repo().find({ userId, categoryId });
};

Budget.byYearAndMonth = async function(userId, year, month) {
    if (typeof year !== 'number') {
        log.warn('Budget.byYearAndMonth misuse: year must be a number');
    }
    if (typeof month !== 'number') {
        log.warn('Budget.byYearAndMonth misuse: month must be a number');
    }
    return await repo().find({ userId, year, month });
};

Budget.byCategoryAndYearAndMonth = async function(userId, categoryId, year, month) {
    if (typeof categoryId !== 'number') {
        log.warn('Budget.byCategoryAndYearAndMonth misuse: categoryId must be a number');
    }
    if (typeof year !== 'number') {
        log.warn('Budget.byCategoryAndYearAndMonth misuse: year must be a number');
    }
    if (typeof month !== 'number') {
        log.warn('Budget.byCategoryAndYearAndMonth misuse: month must be a number');
    }
    return await repo().findOne({ where: { userId, categoryId, year, month } });
};

Budget.findAndUpdate = async function(userId, categoryId, year, month, threshold) {
    const budget = await Budget.byCategoryAndYearAndMonth(userId, categoryId, year, month);
    return await Budget.update(userId, budget.id, { threshold });
};

Budget.destroyForCategory = async function(userId, deletedCategoryId, replacementCategoryId) {
    if (!replacementCategoryId) {
        // Just let cascading delete all the budgets for this category.
        return;
    }

    let budgets = await Budget.byCategory(userId, deletedCategoryId);
    for (let budget of budgets) {
        let replacementCategoryBudget = await Budget.byCategoryAndYearAndMonth(
            userId,
            replacementCategoryId,
            budget.year,
            budget.month
        );

        // If there is no budget for the existing replacement category, don't actually delete
        // the current budget, just update its category with the new one.
        if (!replacementCategoryBudget) {
            await Budget.update(userId, budget.id, { categoryId: replacementCategoryId });
            // Do not delete the budget we just updated.
            continue;
        }

        if (!replacementCategoryBudget.threshold && budget.threshold) {
            // If there is an existing budget without threshold, use the current threshold.
            await Budget.update(userId, replacementCategoryBudget.id, {
                threshold: budget.threshold
            });
        }
    }

    // Let cascading delete the budgets instances attached to this category.
};

Budget.find = async function(userId, budgetId) {
    return await repo().findOne({ where: { id: budgetId, userId } });
};

Budget.exists = async function(userId, budgetId) {
    let found = await Budget.find(userId, budgetId);
    return !!found;
};

Budget.update = async function(userId, budgetId, fields) {
    await repo().update({ userId, id: budgetId }, fields);
    return await Budget.find(userId, budgetId);
};
