"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByYearAndMonth = getByYearAndMonth;
exports.update = update;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
async function createBudget(userId, budget) {
    // Missing parameters
    if (typeof budget.categoryId !== 'undefined') {
        const categoryExists = await models_1.Category.exists(userId, budget.categoryId);
        if (!categoryExists) {
            throw new helpers_1.KError(`Category ${budget.categoryId} not found`, 404);
        }
    }
    const error = (0, validators_1.checkBudget)(budget);
    if (error) {
        throw new helpers_1.KError(error, 400);
    }
    return await models_1.Budget.create(userId, budget);
}
async function getByYearAndMonth(req, res) {
    try {
        const { id: userId } = req.user;
        const { viewId: viewIdStr, year: yearStr, month: monthStr } = req.params;
        const viewId = Number.parseInt(viewIdStr, 10);
        if (Number.isNaN(viewId)) {
            throw new helpers_1.KError('Invalid viewId parameter', 400);
        }
        const year = Number.parseInt(yearStr, 10);
        if (Number.isNaN(year)) {
            throw new helpers_1.KError('Invalid year parameter', 400);
        }
        const month = Number.parseInt(monthStr, 10);
        if (Number.isNaN(month) || month < 0 || month > 11) {
            throw new helpers_1.KError('Invalid month parameter', 400);
        }
        const budgets = await models_1.Budget.byYearAndMonth(userId, viewId, year, month);
        // Ensure there is a budget for each category.
        const categories = await models_1.Category.all(userId);
        for (const cat of categories) {
            if (!budgets.find(b => b.categoryId === cat.id)) {
                // Retrieve the last threshold used for this category instead of defaulting to 0.
                // "last" here means "last in time" not last entered (TODO: fix it when we'll be
                // able to sort by creation/update order).
                const sameCategoryBudgets = await models_1.Budget.byCategory(userId, viewId, cat.id);
                let currentYear = 0;
                let currentMonth = 0;
                let threshold = null;
                for (const b of sameCategoryBudgets) {
                    if (b.year > currentYear ||
                        (b.year === currentYear && b.month > currentMonth)) {
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
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when loading budgets by year/month');
    }
}
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const params = req.body;
        const { viewId: viewIdStr, year: yearStr, month: monthStr, budgetCatId } = req.params;
        const viewId = Number.parseInt(viewIdStr, 10);
        const year = Number.parseInt(yearStr, 10);
        const month = Number.parseInt(monthStr, 10);
        const categoryId = Number.parseInt(budgetCatId, 10);
        const error = (0, validators_1.checkBudget)({
            viewId,
            year,
            month,
            threshold: params.threshold,
        });
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        const newBudget = await models_1.Budget.findAndUpdate(userId, viewId, categoryId, year, month, params.threshold);
        res.status(200).json(newBudget);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating a budget');
    }
}
