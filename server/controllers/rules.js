import Rule from '../models/rule';
import RuleManager from '../lib/rule-manager';
import { makeLogger, asyncErr, KError } from '../helpers';

let log = makeLogger('controllers/rules');

export async function preloadRule(req, res, next, ruleID) {
    try {
        let rule = await Rule.find(ruleID);
        if (!rule) {
            throw new KError('bank rule not found', 404);
        }
        req.preloaded = { rule: Rule.prepare(rule) };
        next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading a rule');
    }
}

export async function create(req, res) {
    try {
        let bankrule = Rule.prepare(req.body);
        let rule = await Rule.create(bankrule);
        res.status(201).send(rule);
    } catch (err) {
        return asyncErr(res, err, 'when creating rule');
    }
}

export async function run(req, res) {
    try {
        let rule = req.preloaded.rule;
        let operations = await RuleManager.run(rule);
        res.status(200).send(operations);
    } catch (err) {
        return asyncErr(res, err, 'when applying rule');
    }
}

export async function runAll(req, res) {
    try {
        let operations = await RuleManager.runAll();
        res.status(200).send(operations);
    } catch (err) {
        return asyncErr(res, err, 'when applying all rules');
    }
}
