import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
    Unique,
} from 'typeorm';

import { getRepository } from '..';

import User from './users';
import Category from './categories';

import { unwrap } from '../../helpers';
import { ForceNumericColumn } from '../helpers';

@Entity('budget')
@Unique(['userId', 'year', 'month', 'categoryId'])
export default class Budget {
    private static REPO: Repository<Budget> | null = null;

    private static repo(): Repository<Budget> {
        if (Budget.REPO === null) {
            Budget.REPO = getRepository(Budget);
        }
        return Budget.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    @ManyToOne(() => Category, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    category!: Category;

    @Column('integer')
    categoryId!: number;

    // Threshold used in the budget section, defined by the user.
    @Column('numeric', { nullable: true, transformer: new ForceNumericColumn() })
    threshold: number | null = null;

    // Year.
    @Column('int')
    year!: number;

    // Month.
    @Column('int')
    month!: number;

    // Static methods.
    static async all(userId: number): Promise<Budget[]> {
        return await Budget.repo().findBy({ userId });
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Budget>): Budget {
        return Budget.repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Budget>): Promise<Budget> {
        const entity = Budget.repo().create({ ...attributes, userId });
        return await Budget.repo().save(entity);
    }

    static async destroy(userId: number, budgetId: number): Promise<void> {
        await Budget.repo().delete({ id: budgetId, userId });
    }

    static async byCategory(userId: number, categoryId: number): Promise<Budget[]> {
        return await Budget.repo().findBy({ userId, categoryId });
    }

    static async byYearAndMonth(userId: number, year: number, month: number): Promise<Budget[]> {
        return await Budget.repo().findBy({ userId, year, month });
    }

    static async byCategoryAndYearAndMonth(
        userId: number,
        categoryId: number,
        year: number,
        month: number
    ): Promise<Budget | null> {
        return await Budget.repo().findOne({ where: { userId, categoryId, year, month } });
    }

    static async findAndUpdate(
        userId: number,
        categoryId: number,
        year: number,
        month: number,
        threshold: number
    ): Promise<Budget> {
        const budget = await Budget.byCategoryAndYearAndMonth(userId, categoryId, year, month);
        if (budget === null) {
            throw new Error('budget not found');
        }
        return await Budget.update(userId, budget.id, { threshold });
    }

    static async replaceForCategory(
        userId: number,
        deletedCategoryId: number,
        replacementCategoryId: number
    ): Promise<void> {
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
    }

    static async destroyAll(userId: number): Promise<void> {
        await Budget.repo().delete({ userId });
    }

    static async find(userId: number, budgetId: number): Promise<Budget | null> {
        return await Budget.repo().findOne({ where: { id: budgetId, userId } });
    }

    static async exists(userId: number, budgetId: number): Promise<boolean> {
        const found = await Budget.find(userId, budgetId);
        return !!found;
    }

    static async update(
        userId: number,
        budgetId: number,
        fields: Partial<Budget>
    ): Promise<Budget> {
        await Budget.repo().update({ userId, id: budgetId }, fields);
        return unwrap(await Budget.find(userId, budgetId));
    }
}
