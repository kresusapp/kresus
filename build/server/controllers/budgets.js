"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
async function createBudget(userId, budget) {
    // Missing parameters
    if (typeof budget.categoryId !== 'undefined') {
        let categoryExists = await models_1.Category.exists(userId, budget.categoryId);
        if (!categoryExists) {
            throw new helpers_1.KError(`Category ${budget.categoryId} not found`, 404);
        }
    }
    const error = validators_1.checkBudget(budget);
    if (error) {
        throw new helpers_1.KError(error, 400);
    }
    return await models_1.Budget.create(userId, budget);
}
async function getByYearAndMonth(req, res) {
    try {
        let { id: userId } = req.user;
        let { year, month } = req.params;
        year = Number.parseInt(year, 10);
        if (Number.isNaN(year)) {
            throw new helpers_1.KError('Invalid year parameter', 400);
        }
        month = Number.parseInt(month, 10);
        if (Number.isNaN(month) || month < 0 || month > 11) {
            throw new helpers_1.KError('Invalid month parameter', 400);
        }
        let budgets = await models_1.Budget.byYearAndMonth(userId, year, month);
        // Ensure there is a budget for each category.
        let categories = await models_1.Category.all(userId);
        for (let cat of categories) {
            if (!budgets.find(b => b.categoryId === cat.id)) {
                // Retrieve the last threshold used for this category instead of defaulting to 0.
                // "last" here means "last in time" not last entered (TODO: fix it when we'll be
                // able to sort by creation/update order).
                let sameCategoryBudgets = await models_1.Budget.byCategory(userId, cat.id);
                let currentYear = 0;
                let currentMonth = 0;
                let threshold = null;
                for (let b of sameCategoryBudgets) {
                    if (b.year > currentYear ||
                        (b.year === currentYear && b.month > currentMonth)) {
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
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when loading budgets by year/month');
    }
}
exports.getByYearAndMonth = getByYearAndMonth;
async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let params = req.body;
        let { year, month, budgetCatId: categoryId } = req.params;
        year = Number.parseInt(year, 10);
        month = Number.parseInt(month, 10);
        categoryId = Number.parseInt(categoryId, 10);
        const error = validators_1.checkBudget({
            year,
            month,
            threshold: params.threshold
        });
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        const newBudget = models_1.Budget.findAndUpdate(userId, categoryId, year, month, params.threshold);
        res.status(200).json(newBudget);
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when updating a budget');
    }
}
exports.update = update;
