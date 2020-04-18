"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const validators_1 = require("../shared/validators");
let log = helpers_1.makeLogger('controllers/categories');
async function preloadCategory(req, res, next, id) {
    try {
        let { id: userId } = req.user;
        let category;
        category = await models_1.Category.find(userId, id);
        if (!category) {
            throw new helpers_1.KError('Category not found', 404);
        }
        req.preloaded = { category };
        return next();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when preloading a category');
    }
}
exports.preloadCategory = preloadCategory;
async function create(req, res) {
    try {
        let { id: userId } = req.user;
        let error = validators_1.checkExactFields(req.body, ['label', 'color']);
        if (error) {
            throw new helpers_1.KError(`when creating a category: ${error}`, 400);
        }
        let created = await models_1.Category.create(userId, req.body);
        res.status(200).json(created);
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when creating category');
    }
}
exports.create = create;
async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let error = validators_1.checkAllowedFields(req.body, ['label', 'color']);
        if (error) {
            throw new helpers_1.KError(`when updating a category: ${error}`, 400);
        }
        let category = req.preloaded.category;
        let newCat = await models_1.Category.update(userId, category.id, req.body);
        res.status(200).json(newCat);
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when updating a category');
    }
}
exports.update = update;
async function destroy(req, res) {
    try {
        let { id: userId } = req.user;
        let error = validators_1.checkExactFields(req.body, ['replaceByCategoryId']);
        if (error) {
            throw new helpers_1.KError('Missing parameter replaceByCategoryId', 400);
        }
        let former = req.preloaded.category;
        let replaceBy = req.body.replaceByCategoryId;
        if (replaceBy !== null) {
            log.debug(`Replacing category ${former.id} by ${replaceBy}...`);
            let categoryToReplaceBy = await models_1.Category.find(userId, replaceBy);
            if (!categoryToReplaceBy) {
                throw new helpers_1.KError('Replacement category not found', 404);
            }
        }
        else {
            log.debug('No replacement category, replacing by the None category.');
        }
        let categoryId = replaceBy;
        let operations = await models_1.Transaction.byCategory(userId, former.id);
        for (let op of operations) {
            await models_1.Transaction.update(userId, op.id, { categoryId });
        }
        await models_1.Budget.destroyForCategory(userId, former.id, categoryId);
        await models_1.Category.destroy(userId, former.id);
        res.status(200).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when deleting a category');
    }
}
exports.destroy = destroy;
