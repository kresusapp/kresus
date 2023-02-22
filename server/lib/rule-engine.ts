import { assert } from '../helpers';
import {
    Transaction,
    TransactionRule,
    TransactionRuleAction,
    TransactionRuleCondition,
} from '../models';

function match(conditions: TransactionRuleCondition[], transaction: Partial<Transaction>): boolean {
    for (const condition of conditions) {
        const value = condition.value;
        switch (condition.type) {
            case 'label_matches_text': {
                const text = value.toLowerCase();
                assert(typeof transaction.label !== 'undefined', 'must have a label');
                assert(typeof transaction.rawLabel !== 'undefined', 'must have a rawLabel');
                if (
                    !transaction.label.toLowerCase().includes(text) &&
                    !transaction.rawLabel.toLowerCase().includes(text)
                ) {
                    return false;
                }
                break;
            }

            case 'label_matches_regexp': {
                const regexp = new RegExp(value);
                assert(typeof transaction.label !== 'undefined', 'must have a label');
                assert(typeof transaction.rawLabel !== 'undefined', 'must have a rawLabel');
                if (!transaction.label.match(regexp) && !transaction.rawLabel.match(regexp)) {
                    return false;
                }
                break;
            }

            case 'amount_equals': {
                const amount = value ? parseFloat(value) : null;
                if (typeof amount === 'number' && !isNaN(amount)) {
                    assert(typeof transaction.amount === 'number', 'must have an amount');
                    if (transaction.amount - amount >= 0.01) {
                        return false;
                    }
                }
                break;
            }

            default:
                assert(false, 'unreachable');
        }
    }

    // Instead of a plain `return true` here, make sure there's at least one
    // condition: a malformed rule would cause weird behaviors.
    return conditions.length > 0;
}

function apply(actions: TransactionRuleAction[], transaction: Partial<Transaction>) {
    for (const action of actions) {
        switch (action.type) {
            case 'categorize': {
                const categoryId = action.categoryId;
                assert(categoryId !== null, 'categoryId must be defined for a categorize action');
                transaction.categoryId = categoryId;
                break;
            }

            default:
                assert(false, 'unreachable');
        }
    }
}

// Apply the transaction rules onto partial transaction objects before they are
// saved into the database.
export default function applyRules(rules: TransactionRule[], transactions: Partial<Transaction>[]) {
    nextTransaction: for (const tr of transactions) {
        for (const rule of rules) {
            if (match(rule.conditions, tr)) {
                apply(rule.actions, tr);
                continue nextTransaction;
            }
        }
    }
}

export async function updateCategorizeRules(
    userId: number,
    prevCategoryId: number,
    newCategoryId: number | null
) {
    const rules = await TransactionRule.getCategorizeRules(userId, prevCategoryId);
    for (const rule of rules) {
        let numActions = rule.actions.length;
        for (const action of rule.actions) {
            if (action.categoryId === prevCategoryId) {
                // We found an action that may require to be deleted or
                // replaced.
                if (newCategoryId !== null) {
                    await TransactionRuleAction.update(userId, action.id, {
                        categoryId: newCategoryId,
                    });
                } else {
                    await TransactionRuleAction.destroy(userId, action.id);
                    numActions -= 1;
                }
            }
        }

        if (numActions === 0) {
            // Remove the rule too.
            await TransactionRule.destroy(userId, rule.id);
        }
    }
}
