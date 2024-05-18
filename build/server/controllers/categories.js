"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = exports.destroyOneCategory = exports.update = exports.create = exports.createOneCategory = exports.preloadCategory = void 0;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
const rule_engine_1 = require("../lib/rule-engine");
const log = (0, helpers_1.makeLogger)('controllers/categories');
async function preloadCategory(req, res, nextHandler, id) {
    try {
        const { id: userId } = req.user;
        const category = await models_1.Category.find(userId, id);
        if (!category) {
            throw new helpers_1.KError('Category not found', 404);
        }
        req.preloaded = { category };
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a category');
    }
}
exports.preloadCategory = preloadCategory;
async function createOneCategory(userId, pod) {
    const error = (0, validators_1.hasForbiddenOrMissingField)(pod, ['label', 'color']);
    if (error) {
        throw new helpers_1.KError(`when creating a category: ${error}`, 400);
    }
    return await models_1.Category.create(userId, pod);
}
exports.createOneCategory = createOneCategory;
async function create(req, res) {
    try {
        const { id: userId } = req.user;
        const created = await createOneCategory(userId, req.body);
        res.status(200).json(created);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating category');
    }
}
exports.create = create;
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const error = (0, validators_1.hasForbiddenField)(req.body, ['label', 'color']);
        if (error) {
            throw new helpers_1.KError(`when updating a category: ${error}`, 400);
        }
        const category = req.preloaded.category;
        const newCat = await models_1.Category.update(userId, category.id, req.body);
        res.status(200).json(newCat);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating a category');
    }
}
exports.update = update;
async function destroyOneCategory(userId, formerId, replaceById) {
    if (replaceById !== null) {
        log.debug(`Replacing category ${formerId} by ${replaceById}...`);
        const categoryToReplaceBy = await models_1.Category.find(userId, replaceById);
        if (!categoryToReplaceBy) {
            throw new helpers_1.KError('Replacement category not found', 404);
        }
    }
    else {
        log.debug('No replacement category, replacing by the None category.');
    }
    if (replaceById !== null) {
        await models_1.Transaction.replaceCategory(userId, formerId, replaceById);
        await models_1.Budget.replaceForCategory(userId, formerId, replaceById);
    }
    await (0, rule_engine_1.updateCategorizeRules)(userId, formerId, replaceById);
    await models_1.Category.destroy(userId, formerId);
}
exports.destroyOneCategory = destroyOneCategory;
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        const error = (0, validators_1.hasForbiddenOrMissingField)(req.body, ['replaceByCategoryId']);
        if (error) {
            throw new helpers_1.KError('Missing parameter replaceByCategoryId', 400);
        }
        const formerId = req.preloaded.category.id;
        const replaceById = req.body.replaceByCategoryId || null;
        await destroyOneCategory(userId, formerId, replaceById);
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when deleting a category');
    }
}
exports.destroy = destroy;
