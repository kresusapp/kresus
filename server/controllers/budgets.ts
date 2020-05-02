import { Budget, Category } from '../models';

import { KError, asyncErr } from '../helpers';
import { checkBudget } from '../shared/validators';

async function createBudget(userId, budget) {
    // Missing parameters
    if (typeof budget.categoryId !== 'undefined') {
        const categoryExists = await Category.exists(userId, budget.categoryId);
        if (!categoryExists) {
            throw new KError(`Category ${budget.categoryId} not found`, 404);
        }
    }

    const error = checkBudget(budget);
    if (error) {
        throw new KError(error, 400);
    }

    return await Budget.create(userId, budget);
}

export async function getByYearAndMonth(req, res) {
    try {
        const { id: userId } = req.user;
        let { year, month } = req.params;

        year = Number.parseInt(year, 10);
        if (Number.isNaN(year)) {
            throw new KError('Invalid year parameter', 400);
        }

        month = Number.parseInt(month, 10);
        if (Number.isNaN(month) || month < 0 || month > 11) {
            throw new KError('Invalid month parameter', 400);
        }

        const budgets = await Budget.byYearAndMonth(userId, year, month);

        // Ensure there is a budget for each category.
        const categories = await Category.all(userId);
        for (const cat of categories) {
            if (!budgets.find(b => b.categoryId === cat.id)) {
                // Retrieve the last threshold used for this category instead of defaulting to 0.
                // "last" here means "last in time" not last entered (TODO: fix it when we'll be
                // able to sort by creation/update order).
                const sameCategoryBudgets = await Budget.byCategory(userId, cat.id);
                let currentYear = 0;
                let currentMonth = 0;
                let threshold: number | null = null;

                for (const b of sameCategoryBudgets) {
                    if (
                        b.year > currentYear ||
                        (b.year === currentYear && b.month > currentMonth)
                    ) {
                        currentYear = b.year;
                        currentMonth = b.month;
                        threshold = b.threshold;
                    }
                }

                const budget = await createBudget(userId, {
                    year,
                    month,
                    categoryId: cat.id,
                    threshold,
                });

                budgets.push(budget);
            }
        }

        res.status(200).json({
            year,
            month,
            budgets,
        });
    } catch (err) {
        return asyncErr(res, err, 'when loading budgets by year/month');
    }
}

export async function update(req, res) {
    try {
        const { id: userId } = req.user;

        const params = req.body;
        let { year, month, budgetCatId: categoryId } = req.params;

        year = Number.parseInt(year, 10);
        month = Number.parseInt(month, 10);
        categoryId = Number.parseInt(categoryId, 10);

        const error = checkBudget({
            year,
            month,
            threshold: params.threshold,
        });
        if (error) {
            throw new KError(error, 400);
        }

        const newBudget = Budget.findAndUpdate(userId, categoryId, year, month, params.threshold);
        res.status(200).json(newBudget);
    } catch (err) {
        return asyncErr(res, err, 'when updating a budget');
    }
}
