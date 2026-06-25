import assert from 'node:assert';

import { Category, TransactionRule } from '../../server/models';
import { updateCategorizeRules } from '../../server/lib/rule-engine';

describe('automatic database cleanups', () => {
    let USER_ID = null;
    let rouge, bleu, vert;
    before(async () => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;

        rouge = await Category.create(USER_ID, {
            label: 'rouge',
            color: null,
        });
        bleu = await Category.create(USER_ID, {
            label: 'bleu',
            color: null,
        });
        vert = await Category.create(USER_ID, {
            label: 'vert',
            color: null,
        });
    });

    it('should create transaction rules correctly', async () => {
        await TransactionRule.create(USER_ID, {
            position: 0,
            conditions: [
                {
                    type: 'label_matches_text',
                    value: 'rouge',
                },
            ],
            actions: [
                {
                    type: 'categorize',
                    categoryId: rouge.id,
                },
            ],
        });

        // This second rule is nonsensical, but we need one way to test
        // rules with  two actions, and the only action so far is
        // categorizing.
        await TransactionRule.create(USER_ID, {
            position: 1,
            conditions: [
                {
                    type: 'label_matches_text',
                    value: 'bleu',
                },
            ],
            actions: [
                {
                    type: 'categorize',
                    categoryId: bleu.id,
                },
                {
                    type: 'categorize',
                    categoryId: vert.id,
                },
            ],
        });

        await TransactionRule.create(USER_ID, {
            position: 2,
            conditions: [
                {
                    type: 'label_matches_text',
                    value: 'vert',
                },
            ],
            actions: [
                {
                    type: 'categorize',
                    categoryId: vert.id,
                },
            ],
        });

        let rules = await TransactionRule.allOrdered(USER_ID);
        assert.strictEqual(rules.length, 3);
    });

    it('should replace categoryId when a category is being replaced', async () => {
        await updateCategorizeRules(USER_ID, rouge.id, bleu.id);

        // At this point:
        // - one rule has a single action, categorize as bleu.id
        // - one rule has two actions, categorize as bleu.id and vert.id
        // - one rule has a single action, categorize as vert.id

        let rules = await TransactionRule.allOrdered(USER_ID);
        assert.strictEqual(rules.length, 3);

        assert.strictEqual(rules[0].actions.length, 1);
        assert.strictEqual(rules[0].actions[0].type, 'categorize');
        assert.strictEqual(rules[0].actions[0].categoryId, bleu.id);

        assert.strictEqual(rules[1].actions.length, 2);
        assert.strictEqual(rules[1].actions[0].type, 'categorize');
        assert.strictEqual(rules[1].actions[0].categoryId, bleu.id);
        assert.strictEqual(rules[1].actions[1].type, 'categorize');
        assert.strictEqual(rules[1].actions[1].categoryId, vert.id);

        assert.strictEqual(rules[2].actions.length, 1);
        assert.strictEqual(rules[2].actions[0].type, 'categorize');
        assert.strictEqual(rules[2].actions[0].categoryId, vert.id);
    });

    it('should remove the rule when a category is deleted and the rule had only one action which is categorize', async () => {
        await updateCategorizeRules(USER_ID, bleu.id, null);

        // At this point, there should be only two rules left, that
        // categorizes both as vert.id.

        let rules = await TransactionRule.allOrdered(USER_ID);
        assert.strictEqual(rules.length, 2);
        for (let rule of rules) {
            assert.strictEqual(rule.actions.length, 1);
            let action = rule.actions[0];
            assert.strictEqual(action.type, 'categorize');
            assert.strictEqual(action.categoryId, vert.id);
        }
    });
});
