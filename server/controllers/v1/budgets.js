import Budgets from '../../models/budgets';
import Categories from '../../models/categories';

import { KError, asyncErr } from '../../helpers';
import { checkBudget } from '../../shared/validators';

async function createBudget(userId, budget) {
    // Missing parameters
    if (typeof budget.categoryId !== 'undefined') {
        let categoryExists = await Categories.exists(userId, budget.categoryId);
        if (!categoryExists) {
            throw new KError(`Category ${budget.categoryId} not found`, 404);
        }
    }

    const error = checkBudget(budget);
    if (error) {
        throw new KError(error, 400);
    }

    return await Budgets.create(userId, budget);
}

export async function getByYearAndMonth(req, res) {
    try {
        let { id: userId } = req.user;
        let { year, month } = req.params;

        year = Number.parseInt(year, 10);
        if (Number.isNaN(year)) {
            throw new KError('Invalid year parameter', 400);
        }

        month = Number.parseInt(month, 10);
        if (Number.isNaN(month) || month < 0 || month > 11) {
            throw new KError('Invalid month parameter', 400);
        }

        let budgets = await Budgets.byYearAndMonth(userId, year, month);

        // Ensure there is a budget for each category.
        let categories = await Categories.all(userId);
        for (let cat of categories) {
            if (!budgets.find(b => b.categoryId === cat.id)) {
                // Retrieve the last threshold used for this category instead of defaulting to 0.
                // "last" here means "last in time" not last entered (TODO: fix it when we'll be
                // able to sort by creation/update order).
                let sameCategoryBudgets = await Budgets.byCategory(userId, cat.id);
                let currentYear = 0;
                let currentMonth = 0;
                let threshold = 0;

                for (let b of sameCategoryBudgets) {
                    if (
                        b.year > currentYear ||
                        (b.year === currentYear && b.month > currentMonth)
                    ) {
                        currentYear = b.year;
                        currentMonth = b.month;
                        threshold = b.threshold;
                    }
                }

                let budget = await createBudget(userId, {
                    year,
                    month,
                    categoryId: cat.id,
                    threshold
                });

                budgets.push(budget);
            }
        }

        res.status(200).json({
            year,
            month,
            budgets
        });
    } catch (err) {
        return asyncErr(res, err, 'when loading budgets by year/month');
    }
}

export async function update(req, res) {
    try {
        let { id: userId } = req.user;

        let params = req.body;
        let { year, month, budgetCatId: categoryId } = req.params;

        year = Number.parseInt(year, 10);
        month = Number.parseInt(month, 10);

        const error = checkBudget({
            year,
            month,
            threshold: params.threshold
        });
        if (error) {
            throw new KError(error, 400);
        }

        const newBudget = Budgets.findAndUpdate(userId, categoryId, year, month, params.threshold);
        res.status(200).json(newBudget);
    } catch (err) {
        return asyncErr(res, err, 'when updating a budget');
    }
}
