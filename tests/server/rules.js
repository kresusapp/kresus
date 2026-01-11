import assert from 'node:assert';

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
        amountCondition,
        categorize42Action,
        categorize43Action,
        textRule,
        regexpRule,
        amountRule,
        combinedRule;

    before(() => {
        textCondition = TransactionRuleCondition.cast({
            type: 'label_matches_text',
            value: 'HELLO',
        });

        regexpCondition = TransactionRuleCondition.cast({
            type: 'label_matches_regexp',
            value: 'two digits [0-9]{2,}',
        });

        amountCondition = TransactionRuleCondition.cast({
            type: 'amount_equals',
            value: '123.45',
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

        amountRule = TransactionRule.cast({
            conditions: [amountCondition],
            actions: [categorize42Action],
        });

        combinedRule = TransactionRule.cast({
            conditions: [textCondition, amountCondition],
            actions: [categorize42Action],
        });
    });

    it('should match text on the label', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'HELLO WORLD',
            rawLabel: 'WORLD',
        });

        applyRules([textRule], [tr]);

        assert.strictEqual(tr.label, 'HELLO WORLD');
        assert.strictEqual(tr.rawLabel, 'WORLD');
        assert.strictEqual(tr.categoryId, 42);
    });

    it('should match text on the rawLabel', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'WORLD',
            rawLabel: 'HELLO WORLD',
        });

        applyRules([textRule], [tr]);

        assert.strictEqual(tr.label, 'WORLD');
        assert.strictEqual(tr.rawLabel, 'HELLO WORLD');
        assert.strictEqual(tr.categoryId, 42);
    });

    it("shouldn't match text if not found", () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'HEY WORLD',
            rawLabel: 'YO WORLD',
        });

        applyRules([textRule], [tr]);

        assert.strictEqual(tr.label, 'HEY WORLD');
        assert.strictEqual(tr.rawLabel, 'YO WORLD');
        assert.strictEqual(tr.categoryId, null);
    });

    it('should not match by regexp if regexp is not matching', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'one digits 4',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        assert.strictEqual(tr.categoryId, null);

        tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 4',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        assert.strictEqual(tr.categoryId, null);

        tr = Transaction.cast({
            categoryId: null,
            label: 'two digits test',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        assert.strictEqual(tr.categoryId, null);
    });

    it('should match by regexp if regexp matches the label', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 42',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        assert.strictEqual(tr.categoryId, 43);

        tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 1337',
            rawLabel: 'hello world',
        });

        applyRules([regexpRule], [tr]);
        assert.strictEqual(tr.categoryId, 43);
    });

    it('should match by amount', () => {
        const tr = Transaction.cast({
            categoryId: null,
            amount: 123.45,
            label: 'two digits 42',
            rawLabel: 'hello world',
        });

        applyRules([amountRule], [tr]);
        assert.strictEqual(tr.categoryId, 42);
    });

    it('should not match by amount if different', () => {
        const tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 1337',
            rawLabel: 'hello world',
            amount: 999999,
        });

        applyRules([amountRule], [tr]);
        assert.strictEqual(tr.categoryId, null);
    });

    it('should match if all conditions match', () => {
        const tr = Transaction.cast({
            categoryId: null,
            label: 'HELLO',
            rawLabel: 'HELLO',
            amount: 123.45,
        });

        applyRules([combinedRule], [tr]);
        assert.strictEqual(tr.categoryId, 42);
    });

    it('should not match if any of the conditions does not match', () => {
        const tr = Transaction.cast({
            categoryId: null,
            label: 'HELLO',
            rawLabel: 'HELLO',
            amount: 9999,
        });

        applyRules([combinedRule], [tr]);
        assert.strictEqual(tr.categoryId, null);
    });

    it('should respect the order of the rules array when no rule aborts execution', () => {
        let tr = Transaction.cast({
            categoryId: null,
            label: 'two digits 42',
            rawLabel: 'HELLO WORLD',
        });

        // Test rule applies first, which sets category 42.
        applyRules([textRule, regexpRule], [tr]);
        assert.strictEqual(tr.categoryId, 42);

        // Regexp rule applies first, which sets category 43.
        applyRules([regexpRule, textRule], [tr]);
        assert.strictEqual(tr.categoryId, 43);
    });
});
