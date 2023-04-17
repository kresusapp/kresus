"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = exports.swapPositions = exports.update = exports.create = exports.all = exports.preloadOther = exports.preload = exports.conditionTypesList = void 0;
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const validators_1 = require("../shared/validators");
exports.conditionTypesList = [
    'label_matches_text',
    'label_matches_regexp',
    'amount_equals',
];
async function preload(req, res, nextHandler, id) {
    try {
        const { id: userId } = req.user;
        const rule = await models_1.TransactionRule.find(userId, id);
        if (!rule) {
            throw new helpers_1.KError('Rule not found', 404);
        }
        req.preloaded = { rule };
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a rule');
    }
}
exports.preload = preload;
async function preloadOther(req, res, nextHandler, id) {
    try {
        const { id: userId } = req.user;
        const rule = await models_1.TransactionRule.find(userId, id);
        if (!rule) {
            throw new helpers_1.KError('Rule not found', 404);
        }
        req.preloaded = { ...req.preloaded, other: rule };
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a rule');
    }
}
exports.preloadOther = preloadOther;
async function all(req, res) {
    try {
        const userId = req.user.id;
        const rules = await models_1.TransactionRule.allOrdered(userId);
        res.status(200).json(rules);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when retrieving rules');
    }
}
exports.all = all;
function checkDependencies(actions, conditions, allowIds) {
    const extraFields = allowIds ? ['id'] : [];
    let error;
    for (const action of actions) {
        if (action.type === 'categorize') {
            error = (0, validators_1.hasForbiddenOrMissingField)(action, ['type', 'categoryId', ...extraFields]);
            if (error) {
                throw new helpers_1.KError(error, 400);
            }
            if (typeof action.categoryId !== 'number') {
                throw new helpers_1.KError('missing category id for a categorize rule', 400);
            }
            continue;
        }
        throw new helpers_1.KError('invalid or missing action type', 400);
    }
    for (const condition of conditions) {
        // The extra fields like id are not mandatory (ex: a new condition is added on the fly on update).
        error = (0, validators_1.hasMissingField)(condition, ['type', 'value']);
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        error = (0, validators_1.hasForbiddenField)(condition, ['type', 'value', ...extraFields]);
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        if (!exports.conditionTypesList.includes(condition.type)) {
            throw new helpers_1.KError('invalid condition type', 400);
        }
    }
}
async function create(req, res) {
    try {
        const userId = req.user.id;
        const error = (0, validators_1.hasForbiddenOrMissingField)(req.body, ['actions', 'conditions']);
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        checkDependencies(req.body.actions, req.body.conditions, false);
        if (req.body.conditions.length < 1 || req.body.actions.length < 1) {
            throw new helpers_1.KError('rule must have at least one condition and one action', 400);
        }
        const maxPosition = await models_1.TransactionRule.maxPosition(userId);
        const position = maxPosition !== null ? maxPosition + 1 : 0;
        const rule = {
            position,
            conditions: req.body.conditions,
            actions: req.body.actions,
        };
        const created = await models_1.TransactionRule.create(userId, rule);
        res.status(200).json(created);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating a rule');
    }
}
exports.create = create;
// Can only update actions/conditions that were already inserted into the
// database. Doesn't allow removing or adding new actions and conditions (yet).
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const { rule } = req.preloaded;
        const newFields = req.body;
        const error = (0, validators_1.hasForbiddenField)(newFields, ['actions', 'conditions']);
        if (error) {
            throw new helpers_1.KError(error, 400);
        }
        checkDependencies(newFields.actions, newFields.conditions, true);
        // Retrieve current conditions
        const currentConditions = await models_1.TransactionRuleCondition.byRuleId(userId, rule.id);
        // Update the existing ones, and create the others
        for (const condition of newFields.conditions) {
            const dbCondition = currentConditions.find(current => current.type === condition.type);
            if (!dbCondition) {
                // Create it
                await models_1.TransactionRuleCondition.create(userId, { ...condition, ruleId: rule.id });
            }
            else {
                if (dbCondition.ruleId !== rule.id) {
                    throw new helpers_1.KError("a condition isn't tied to the given rule", 400);
                }
                await models_1.TransactionRuleCondition.update(userId, dbCondition.id, condition);
            }
        }
        // Delete those that don't exist anymore
        for (const current of currentConditions) {
            const exists = newFields.conditions.some((c) => c.type === current.type);
            if (!exists) {
                await models_1.TransactionRuleCondition.destroy(userId, current.id);
            }
        }
        for (const action of newFields.actions) {
            const dbAction = await models_1.TransactionRuleAction.find(userId, action.id);
            if (!dbAction || dbAction.ruleId !== rule.id) {
                throw new helpers_1.KError("an action isn't tied to the given rule", 400);
            }
            await models_1.TransactionRuleAction.update(userId, action.id, action);
        }
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating a rule');
    }
}
exports.update = update;
async function swapPositions(req, res) {
    try {
        const { id: userId } = req.user;
        const { rule, other } = req.preloaded;
        (0, helpers_1.assert)(other.position !== rule.position, "position can't be the same!");
        await models_1.TransactionRule.update(userId, rule.id, {
            position: other.position,
        });
        await models_1.TransactionRule.update(userId, other.id, {
            position: rule.position,
        });
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when deleting a rule');
    }
}
exports.swapPositions = swapPositions;
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        const { rule } = req.preloaded;
        await models_1.TransactionRule.destroy(userId, rule.id);
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when deleting a rule');
    }
}
exports.destroy = destroy;
