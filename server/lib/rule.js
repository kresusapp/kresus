import Condition from './condition';
import Action from './action';

/*
    A rule has this struscture:
    { promise: Condition, actions: [Action] }
*/

class Rule {
    constructor(rule) {
        if (!rule.hasOwnProperty('promise')) {
            throw new Error('A rule must have promisses property');
        }
        if (!rule.hasOwnProperty('actions')) {
            throw new Error('A rule must have actions property');
        }
        if (!rule.actions instanceof Array) {
            throw new Error('Promisses property of a rule must be an array');
        }
        if (rule.actions.length === 0) {
            throw new Error('A rule should have at least an action');
        }
        this.actions = rule.actions.map(action => new Action(action));
        this.promise = new Condition(rule.promise);
    }

    run(object) {
        if (object instanceof Array) {
            return object.map(obj => this.run(obj), this);
        }
        return this.promise.check(object) ?
               this.actions.reduce((obj, action) => action.act(obj), object) :
               object;
    }
}
export default Rule;
