"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = applyRules;
exports.updateCategorizeRules = updateCategorizeRules;
const helpers_1 = require("../helpers");
const models_1 = require("../models");
function match(conditions, transaction) {
    for (const condition of conditions) {
        const value = condition.value;
        switch (condition.type) {
            case 'label_matches_text': {
                const text = value.toLowerCase();
                (0, helpers_1.assert)(typeof transaction.label !== 'undefined', 'must have a label');
                (0, helpers_1.assert)(typeof transaction.rawLabel !== 'undefined', 'must have a rawLabel');
                if (!transaction.label.toLowerCase().includes(text) &&
                    !transaction.rawLabel.toLowerCase().includes(text)) {
                    return false;
                }
                break;
            }
            case 'label_matches_regexp': {
                const regexp = new RegExp(value);
                (0, helpers_1.assert)(typeof transaction.label !== 'undefined', 'must have a label');
                (0, helpers_1.assert)(typeof transaction.rawLabel !== 'undefined', 'must have a rawLabel');
                if (!transaction.label.match(regexp) && !transaction.rawLabel.match(regexp)) {
                    return false;
                }
                break;
            }
            case 'amount_equals': {
                const amount = value ? parseFloat(value) : null;
                if (typeof amount === 'number' && !isNaN(amount)) {
                    (0, helpers_1.assert)(typeof transaction.amount === 'number', 'must have an amount');
                    if (transaction.amount - amount >= 0.01) {
                        return false;
                    }
                }
                break;
            }
            default:
                (0, helpers_1.assert)(false, 'unreachable');
        }
    }
    // Instead of a plain `return true` here, make sure there's at least one
    // condition: a malformed rule would cause weird behaviors.
    return conditions.length > 0;
}
function apply(actions, transaction) {
    for (const action of actions) {
        switch (action.type) {
            case 'categorize': {
                const categoryId = action.categoryId;
                (0, helpers_1.assert)(categoryId !== null, 'categoryId must be defined for a categorize action');
                transaction.categoryId = categoryId;
                break;
            }
            default:
                (0, helpers_1.assert)(false, 'unreachable');
        }
    }
}
// Apply the transaction rules onto partial transaction objects before they are
// saved into the database.
function applyRules(rules, transactions) {
    nextTransaction: for (const tr of transactions) {
        for (const rule of rules) {
            if (match(rule.conditions, tr)) {
                apply(rule.actions, tr);
                continue nextTransaction;
            }
        }
    }
}
async function updateCategorizeRules(userId, prevCategoryId, newCategoryId) {
    const rules = await models_1.TransactionRule.getCategorizeRules(userId, prevCategoryId);
    for (const rule of rules) {
        let numActions = rule.actions.length;
        for (const action of rule.actions) {
            if (action.categoryId === prevCategoryId) {
                // We found an action that may require to be deleted or
                // replaced.
                if (newCategoryId !== null) {
                    await models_1.TransactionRuleAction.update(userId, action.id, {
                        categoryId: newCategoryId,
                    });
                }
                else {
                    await models_1.TransactionRuleAction.destroy(userId, action.id);
                    numActions -= 1;
                }
            }
        }
        if (numActions === 0) {
            // Remove the rule too.
            await models_1.TransactionRule.destroy(userId, rule.id);
        }
    }
}
