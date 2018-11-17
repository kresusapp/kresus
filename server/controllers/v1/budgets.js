import Budget from '../../models/budget';
import Category from '../../models/category';

import { KError, asyncErr } from '../../helpers';
import { checkBudget } from '../../shared/validators';

async function createBudget(userId, budget) {
    // Missing parameters
    if (typeof budget.categoryId !== 'undefined') {
        let categoryExists = await Category.exists(userId, budget.categoryId);
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
        let { id: userId } = req.user;
        let { year, month } = req.params;
        year = Number.parseInt(year, 10);
        month = Number.parseInt(month, 10);

        if (Number.isNaN(year)) {
            throw new KError('Invalid year parameter', 400);
        }

        if (Number.isNaN(month) || month < 0 || month > 11) {
            throw new KError('Invalid month parameter', 400);
        }

        let budgets = await Budget.byYearAndMonth(userId, year, month);

        // Ensure there is a budget for each category
        let categoriesNamesMap = new Map();
        let categories = await Category.all(userId);
        for (let cat of categories) {
            categoriesNamesMap.set(cat.id, cat.title);
            if (!budgets.find(b => b.categoryId === cat.id)) {
                // Retrieve the last threshold used for this category instead of defaulting to 0.
                // "last" here means "last in time" not last entered (TODO: fix it when we'll be
                // able to sort by creation/update order).
                let sameCategoryBudgets = await Budget.byCategory(userId, cat.id);
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

        // Sort by categories titles
        budgets.sort((prev, next) => {
            let prevName = categoriesNamesMap.get(prev.categoryId).toUpperCase();
            let nextName = categoriesNamesMap.get(next.categoryId).toUpperCase();

            if (prevName < nextName) {
                return -1;
            }

            if (prevName > nextName) {
                return 1;
            }

            return 0;
        });

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

        const newBudget = Budget.update(userId, categoryId, year, month, params.threshold);
        res.status(200).json(newBudget);
    } catch (err) {
        return asyncErr(res, err, 'when updating a budget');
    }
}
