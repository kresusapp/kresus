import should from 'should';

import { Category, TransactionRule } from '../../server/models';
import { updateCategorizeRules } from '../../server/lib/rule-engine';

describe('automatic database cleanups', () => {
    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.user.id;
    });

    let rouge, bleu, vert;
    before(async () => {
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
        rules.length.should.equal(3);
    });

    it('should replace categoryId when a category is being replaced', async () => {
        await updateCategorizeRules(USER_ID, rouge.id, bleu.id);

        // At this point:
        // - one rule has a single action, categorize as bleu.id
        // - one rule has two actions, categorize as bleu.id and vert.id
        // - one rule has a single action, categorize as vert.id

        let rules = await TransactionRule.allOrdered(USER_ID);
        rules.length.should.equal(3);

        rules[0].actions.length.should.equal(1);
        rules[0].actions[0].type.should.equal('categorize');
        rules[0].actions[0].categoryId.should.equal(bleu.id);

        rules[1].actions.length.should.equal(2);
        rules[1].actions[0].type.should.equal('categorize');
        rules[1].actions[0].categoryId.should.equal(bleu.id);
        rules[1].actions[1].type.should.equal('categorize');
        rules[1].actions[1].categoryId.should.equal(vert.id);

        rules[2].actions.length.should.equal(1);
        rules[2].actions[0].type.should.equal('categorize');
        rules[2].actions[0].categoryId.should.equal(vert.id);
    });

    it('should remove the rule when a category is deleted and the rule had only one action which is categorize', async () => {
        await updateCategorizeRules(USER_ID, bleu.id, null);

        // At this point, there should be only two rules left, that
        // categorizes both as vert.id.

        let rules = await TransactionRule.allOrdered(USER_ID);
        rules.length.should.equal(2);
        for (let rule of rules) {
            rule.actions.length.should.equal(1);
            let action = rule.actions[0];
            action.type.should.equal('categorize');
            action.categoryId.should.equal(vert.id);
        }
    });
});
