import express from 'express';
import { assert, asyncErr, KError } from '../helpers';
import { TransactionRule, TransactionRuleAction, TransactionRuleCondition } from '../models';
import {
    hasForbiddenField,
    hasMissingField,
    hasForbiddenOrMissingField,
} from '../shared/validators';
import { IdentifiedRequest, PreloadedRequest } from './routes';
import type { TransactionRuleConditionType } from '../shared/types';

const conditionTypesList: TransactionRuleConditionType[] = [
    'label_matches_text',
    'label_matches_regexp',
    'amount_equals',
];

export async function preload(
    req: IdentifiedRequest<TransactionRule>,
    res: express.Response,
    nextHandler: () => void,
    id: number
) {
    try {
        const { id: userId } = req.user;
        const rule = await TransactionRule.find(userId, id);
        if (!rule) {
            throw new KError('Rule not found', 404);
        }
        req.preloaded = { rule };
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a rule');
    }
}

export async function preloadOther(
    req: IdentifiedRequest<TransactionRule>,
    res: express.Response,
    nextHandler: () => void,
    id: number
) {
    try {
        const { id: userId } = req.user;
        const rule = await TransactionRule.find(userId, id);
        if (!rule) {
            throw new KError('Rule not found', 404);
        }
        req.preloaded = { ...req.preloaded, other: rule };
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a rule');
    }
}

export async function all(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const userId = req.user.id;
        const rules = await TransactionRule.allOrdered(userId);
        res.status(200).json(rules);
    } catch (err) {
        asyncErr(res, err, 'when retrieving rules');
    }
}

function checkDependencies(actions: any[], conditions: any[], allowIds: boolean) {
    const extraFields = allowIds ? ['id'] : [];
    let error;
    for (const action of actions) {
        if (action.type === 'categorize') {
            error = hasForbiddenOrMissingField(action, ['type', 'categoryId', ...extraFields]);
            if (error) {
                throw new KError(error, 400);
            }
            if (typeof action.categoryId !== 'number') {
                throw new KError('missing category id for a categorize rule', 400);
            }
            continue;
        }
        throw new KError('invalid or missing action type', 400);
    }

    for (const condition of conditions) {
        // The extra fields like id are not mandatory (ex: a new condition is added on the fly on update).
        error = hasMissingField(condition, ['type', 'value']);
        if (error) {
            throw new KError(error, 400);
        }

        error = hasForbiddenField(condition, ['type', 'value', ...extraFields]);
        if (error) {
            throw new KError(error, 400);
        }

        if (!conditionTypesList.includes(condition.type)) {
            throw new KError('invalid condition type', 400);
        }
    }
}

export async function create(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const userId = req.user.id;
        const error = hasForbiddenOrMissingField(req.body, ['actions', 'conditions']);
        if (error) {
            throw new KError(error, 400);
        }

        checkDependencies(req.body.actions, req.body.conditions, false);

        if (req.body.conditions.length < 1 || req.body.actions.length < 1) {
            throw new KError('rule must have at least one condition and one action', 400);
        }

        const maxPosition = await TransactionRule.maxPosition(userId);
        const position = maxPosition !== null ? maxPosition + 1 : 0;

        const rule = {
            position,
            conditions: req.body.conditions,
            actions: req.body.actions,
        };

        const created = await TransactionRule.create(userId, rule);
        res.status(200).json(created);
    } catch (err) {
        asyncErr(res, err, 'when creating a rule');
    }
}

// Can only update actions/conditions that were already inserted into the
// database. Doesn't allow removing or adding new actions and conditions (yet).
export async function update(req: PreloadedRequest<TransactionRule>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { rule } = req.preloaded;

        const newFields = req.body;

        const error = hasForbiddenField(newFields, ['actions', 'conditions']);
        if (error) {
            throw new KError(error, 400);
        }

        checkDependencies(newFields.actions, newFields.conditions, true);

        // Retrieve current conditions
        const currentConditions = await TransactionRuleCondition.byRuleId(userId, rule.id);

        // Update the existing ones, and create the others
        for (const condition of newFields.conditions) {
            const dbCondition = currentConditions.find(current => current.type === condition.type);

            if (!dbCondition) {
                // Create it
                await TransactionRuleCondition.create(userId, { ...condition, ruleId: rule.id });
            } else {
                if (dbCondition.ruleId !== rule.id) {
                    throw new KError("a condition isn't tied to the given rule", 400);
                }

                await TransactionRuleCondition.update(userId, dbCondition.id, condition);
            }
        }

        // Delete those that don't exist anymore
        for (const current of currentConditions) {
            const exists = newFields.conditions.some(
                (c: Partial<TransactionRuleCondition>) => c.type === current.type
            );
            if (!exists) {
                await TransactionRuleCondition.destroy(userId, current.id);
            }
        }

        for (const action of newFields.actions) {
            const dbAction = await TransactionRuleAction.find(userId, action.id);
            if (!dbAction || dbAction.ruleId !== rule.id) {
                throw new KError("an action isn't tied to the given rule", 400);
            }
            await TransactionRuleAction.update(userId, action.id, action);
        }

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when updating a rule');
    }
}

export async function swapPositions(req: PreloadedRequest<TransactionRule>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { rule, other } = req.preloaded;

        assert(other.position !== rule.position, "position can't be the same!");

        await TransactionRule.update(userId, rule.id, {
            position: other.position,
        });
        await TransactionRule.update(userId, other.id, {
            position: rule.position,
        });

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting a rule');
    }
}

export async function destroy(req: PreloadedRequest<TransactionRule>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { rule } = req.preloaded;
        await TransactionRule.destroy(userId, rule.id);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting a rule');
    }
}
