import * as americano from 'cozydb';
import { makeLogger, promisifyModel, assertHas } from '../helpers';
import Rule from './lib/rule';

let log = makeLogger('models/rule');

let BankRule = americano.getModel('bankrule', {
    // Priority of the rule. Rules are applied in order of priority, the smaller the more prioritary
    priority: Number,
    rule: Rule,
    enabled: Boolean,
});

BankRule.prepare = function(bankrule) {
    assertHas(bankrule, 'rule');
    let { priority, enabled } = bankrule;
    return { priority, enabled, rule: new Rule(bankrule.rule) };
};



BankRule = promisifyModel(BankRule);

module.exports = BankRule;
