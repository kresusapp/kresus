import express from 'express';
import { Budget, Category } from '../models';

import { KError, asyncErr } from '../helpers';
import { checkBudget } from '../shared/validators';
import { IdentifiedRequest, PreloadedRequest } from './routes';

async function createBudget(
    userId: number,
    budget: {
        viewId: number;
        year: number;
        month: number;
        categoryId: number;
        threshold: number | null;
    }
) {
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

export async function getByYearAndMonth(req: IdentifiedRequest<Budget>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { viewId: viewIdStr, year: yearStr, month: monthStr } = req.params;

        const viewId = Number.parseInt(viewIdStr, 10);
        if (Number.isNaN(viewId)) {
            throw new KError('Invalid viewId parameter', 400);
        }

        const year = Number.parseInt(yearStr, 10);
        if (Number.isNaN(year)) {
            throw new KError('Invalid year parameter', 400);
        }

        const month = Number.parseInt(monthStr, 10);
        if (Number.isNaN(month) || month < 0 || month > 11) {
            throw new KError('Invalid month parameter', 400);
        }

        const budgets = await Budget.byYearAndMonth(userId, viewId, year, month);

        // Ensure there is a budget for each category.
        const categories = await Category.all(userId);
        for (const cat of categories) {
            if (!budgets.find(b => b.categoryId === cat.id)) {
                // Retrieve the last threshold used for this category instead of defaulting to 0.
                // "last" here means "last in time" not last entered (TODO: fix it when we'll be
                // able to sort by creation/update order).
                const sameCategoryBudgets = await Budget.byCategory(userId, viewId, cat.id);
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
                    viewId,
                    year,
                    month,
                    categoryId: cat.id,
                    threshold,
                });

                budgets.push(budget);
            }
        }

        res.status(200).json({
            viewId,
            year,
            month,
            budgets,
        });
    } catch (err) {
        asyncErr(res, err, 'when loading budgets by year/month');
    }
}

export async function update(req: PreloadedRequest<Budget>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const params = req.body;
        const { viewId: viewIdStr, year: yearStr, month: monthStr, budgetCatId } = req.params;

        const viewId = Number.parseInt(viewIdStr, 10);
        const year = Number.parseInt(yearStr, 10);
        const month = Number.parseInt(monthStr, 10);
        const categoryId = Number.parseInt(budgetCatId, 10);

        const error = checkBudget({
            viewId,
            year,
            month,
            threshold: params.threshold,
        });
        if (error) {
            throw new KError(error, 400);
        }

        const newBudget = await Budget.findAndUpdate(
            userId,
            viewId,
            categoryId,
            year,
            month,
            params.threshold
        );
        res.status(200).json(newBudget);
    } catch (err) {
        asyncErr(res, err, 'when updating a budget');
    }
}
