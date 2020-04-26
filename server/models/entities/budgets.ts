import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
} from 'typeorm';

import User from './users';
import Category from './categories';

import { makeLogger, unwrap } from '../../helpers';
import { ForceNumericColumn } from '../helpers';

const log = makeLogger('models/entities/budget');

@Entity('budget')
export default class Budget {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Static methods.
    static async all(userId): Promise<Budget[]> {
        return await repo().find({ userId });
    }

    static async create(userId: number, attributes: Partial<Budget>): Promise<Budget> {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }

    static async destroy(userId, budgetId): Promise<void> {
        await repo().delete({ id: budgetId, userId });
    }

    static async byCategory(userId, categoryId): Promise<Budget[]> {
        if (typeof categoryId !== 'number') {
            log.warn(`Budget.byCategory API misuse: ${categoryId}`);
        }
        return await repo().find({ userId, categoryId });
    }

    static async byYearAndMonth(userId, year, month): Promise<Budget[]> {
        if (typeof year !== 'number') {
            log.warn('Budget.byYearAndMonth misuse: year must be a number');
        }
        if (typeof month !== 'number') {
            log.warn('Budget.byYearAndMonth misuse: month must be a number');
        }
        return await repo().find({ userId, year, month });
    }

    static async byCategoryAndYearAndMonth(
        userId,
        categoryId,
        year,
        month
    ): Promise<Budget | undefined> {
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
    }

    static async findAndUpdate(userId, categoryId, year, month, threshold): Promise<Budget> {
        const budget = await Budget.byCategoryAndYearAndMonth(userId, categoryId, year, month);
        if (typeof budget === 'undefined') {
            throw new Error('budget not found');
        }
        return await Budget.update(userId, budget.id, { threshold });
    }

    static async destroyForCategory(
        userId,
        deletedCategoryId,
        replacementCategoryId?
    ): Promise<void> {
        if (!replacementCategoryId) {
            // Just let cascading delete all the budgets for this category.
            return;
        }

        const budgets = await Budget.byCategory(userId, deletedCategoryId);
        for (const budget of budgets) {
            const replacementCategoryBudget = await Budget.byCategoryAndYearAndMonth(
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
                    threshold: budget.threshold,
                });
            }
        }

        // Let cascading delete the budgets instances attached to this category.
    }

    static async destroyAll(userId): Promise<void> {
        await repo().delete({ userId });
    }

    static async find(userId, budgetId): Promise<Budget | undefined> {
        return await repo().findOne({ where: { id: budgetId, userId } });
    }

    static async exists(userId, budgetId): Promise<boolean> {
        const found = await Budget.find(userId, budgetId);
        return !!found;
    }

    static async update(userId, budgetId, fields): Promise<Budget> {
        await repo().update({ userId, id: budgetId }, fields);
        return unwrap(await Budget.find(userId, budgetId));
    }
}

let REPO: Repository<Budget> | null = null;
function repo(): Repository<Budget> {
    if (REPO === null) {
        REPO = getRepository(Budget);
    }
    return REPO;
}
