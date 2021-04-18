import should from 'should';

import {
    TransactionRule,
    Transaction,
    TransactionRuleAction,
    TransactionRuleCondition,
} from '../../server/models';
import applyRules from '../../server/lib/rule-engine';

describe('rule based engine for transactions', () => {
    let textCondition,
        regexpCondition,
        categorize42Action,
        categorize43Action,
        textRule,
        regexpRule;

    before(() => {
        textCondition = TransactionRuleCondition.cast({
            type: 'label_matches_text',
            value: 'HELLO',
        });

        regexpCondition = TransactionRuleCondition.cast({
            type: 'label_matches_regexp',
            value: 'two digits [0-9]{2,}',
        });

        categorize42Action = TransactionRuleAction.cast({
            type: 'categorize',
            categoryId: 42,
        });

        categorize43Action = TransactionRuleAction.cast({
            type: 'categorize',
            categoryId: 43,
        });

        textRule = TransactionRule.cast({
            conditions: [textCondition],
            actions: [categorize42Action],
        });

        regexpRule = TransactionRule.cast({
            conditions: [regexpCondition],
            actions: [categorize43Action],
        });
    });

    it('should match text on the label', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'HELLO WORLD',
            rawLabel: 'WORLD',
        });

        applyRules([textRule], [tr]);

        tr.label.should.be.equal('HELLO WORLD');
        tr.rawLabel.should.be.equal('WORLD');
        tr.categoryId.should.be.equal(42);
    });

    it('should match text on the rawLabel', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'WORLD',
            rawLabel: 'HELLO WORLD',
        });

        applyRules([textRule], [tr]);

        tr.label.should.be.equal('WORLD');
        tr.rawLabel.should.be.equal('HELLO WORLD');
        tr.categoryId.should.be.equal(42);
    });

    it("shouldn't match text if not found", () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'HEY WORLD',
            rawLabel: 'YO WORLD',
        });

        applyRules([textRule], [tr]);

        tr.label.should.be.equal('HEY WORLD');
        tr.rawLabel.should.be.equal('YO WORLD');
        should.equal(tr.categoryId, null);
    });

    it('should not match by regexp if regexp is not matching', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'one digits 4',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        should.equal(tr.categoryId, null);

        tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 4',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        should.equal(tr.categoryId, null);

        tr = Transaction.cast({
            categoryId: null,
            label: 'two digits test',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        should.equal(tr.categoryId, null);
    });

    it('should match by regexp if regexp matches the label', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 42',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        should.equal(tr.categoryId, 43);

        tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 1337',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        should.equal(tr.categoryId, 43);
    });

    it('should respect the order of the rules array when no rule aborts execution', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 42',
            rawLabel: 'HELLO WORLD',
        });

        // Test rule applies first, which sets category 42.
        applyRules([textRule, regexpRule], [tr]);
        should.equal(tr.categoryId, 42);

        // Regexp rule applies first, which sets category 43.
        applyRules([regexpRule, textRule], [tr]);
        should.equal(tr.categoryId, 43);
    });
});
