import Operation from '../models/operation';
import Rule from '../models/rule';
import { KError } from '../helpers';
class RuleManager {


    // Apply a rule to all operations
    async runOneOnAll(rule) {
        try {
            let operations = await Operation.all();
            return this.runOnOperations(rule, operations);
        } catch (err) {
            throw new KError(`error when applying rule to all operations: ${err}`);
        }
    }

    // Apply one on one
    async runOneOnOne(rule, operation) {
        try {
            let op = rule.run(operation);
            // TODO add a check if save is needed;
            let savedOp = await op.save();
            return savedOp;
        } catch (err) {
            throw new KError(`error when applying rule: ${err}`);
        }
    }

    // Apply a rule on a set of operations
    async runOneOnSome(rule, operations) {
        try {
            // To analyse : return all operations or only the one saved.
            return await operations.map(op => this.runOneOnOne(rule, op), this);
        } catch (err) {
            throw new KError(`error when applying rule: ${err}`);
        }
    }

    // Apply several rules to one operation
    async runSomeOnOne(rules, operation) {
        try {
            let modifiedOp = rules.reduce((rule, o) => rule.run(o), operation);
            let savedOp = await modifiedOp.save();
            return savedOp;
        } catch (err) {
            throw new KError(`error when applying several rules to one operation: ${err}`);
        }
    }

    // Apply several rules to several operations
    async runSomeOnSome(rules, operations) {
        try {
            return await operations.map(op => this.runSomeOnOne(rules, op), this);
        } catch (err) {
            throw new KError(`error when applying several rules to several operations: ${err}`);
        }
    }

    async runAllOnSome(operations) {
        try {
            let rules = await Rule.all();
            if (rules) {
                return await this.runSomeOnSome(rules, operations);
            }
            return rules;
        } catch (err) {
            throw new KError(`error when applying all the rules to several operations: ${err}`);
        }
    }
}
let Export = new RuleManager();
export default Export;
