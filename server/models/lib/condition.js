// List of possible condition predicates
const predicates = [
// Does not contain
    '$nct',
// Contains
    '$ct',
// Greater than
    '$gt',
// Greater than or equal
    '$ge',
// Lower than
    '$lt',
// Lower than or equal
    '$le',
// equal
    '$eq',
// not equal
    '$neq'
];

// Predicates allowing array values
const operators = [
    '$or',
    '$and'
];

/*
    A rule has this struscture:
    { condition: { property: { predicate: value }}, actions: [{ property: { predicate: value } }] }
*/

class Condition {
    constructor(condition) {

        /*
        The condition should have the following pattern :
        { property: { predicate: value } } or :
        { operator: [Condition]}
        */

        if (Object.keys(condition).length !== 1) {
            throw new Error('A condition should have one and only one property');
        }
        let predicate = Object.keys(condition)[0];
        if (predicates.indexOf(predicate) !== -1 && operators.indexOf(predicate) === -1) {
            throw new Error(`Reserved value for property: ${predicate}`);
        }
        if (operators.indexOf(predicate) !== -1) {
            this.predicate = predicate;
            if (!condition[this.predicate] instanceof Array) {
                throw new Error('Operator type conditions should have arry "Value"');
            }

            this.value = condition[this.predicate].map(value => new Condition(value));
        } else {
            let property = predicate;
            this.property = property;
            let test = condition[this.property];

            if (Object.keys(test).length !== 1) {
                throw new Error('A condition should be of type { property: { predicate: value } }');
            }

            this.predicate = Object.keys(test)[0];
            if (predicates.indexOf(this.predicate) === -1) {
                throw new Error(`${this.predicate} is not a valid value for a predicate.`);
            }

            let value = test[this.predicate];
            if (value instanceof Array) {
                throw new Error(`Only ${predicates.toString()} can have Array values`);
            }

            this.value = value;
        }
    }

// Todo : factorize lower/greater check;

    check(object) {
        if (this.property && !object.hasOwnProperty(this.property)) {
            return false;
        }

        let result;
        switch (this.predicate) {
            case '$ct':
                result = this.contains(object);
                break;
            case '$nct':
                result = !this.contains(object);
                break;
            case '$gt':
                result = this.greater(object);
                break;
            case '$ge':
                result = !this.lower(object);
                break;
            case '$lt':
                result = this.lower(object);
                break;
            case '$le':
                result = !this.greater(object);
                break;
            case '$eq':
                result = this.equal(object);
                break;
            case '$neq':
                result = !this.equal(object);
                break;
            case '$and':
                result = this.and(object);
                break;
            case '$or':
                result = this.or(object);
                break;
            default:
                throw new Error(`Invalid predicate: ${this.predicate}`);
        }

        return result;
    }

    toString() {
        let string;
        if (this.property) {
            string = `{${this.property}:{${this.predicate}:${this.value.toString()}}}`;
        } else {
            string = `{${this.predicate}:[${this.value.toString()}]}`;
        }
        return string;
    }

    greater(object) {
        if (isNaN(parseFloat(object[this.property])) ||
            isNaN(parseFloat(this.value))) {
            throw new Error(`${object[this.property]} and value ${this.value} should be numbers`);
        }
        return object[this.property] > this.value;
    }

    lower(object) {
        if (isNaN(parseFloat(object[this.property])) ||
            isNaN(parseFloat(this.value))) {
            throw new Error(`${object[this.property]} and value ${this.value} should be numbers`);
        }
        return object[this.property] < this.value;
    }

    equal(object) {
        return object[this.property] === this.value ||
               object[this.property].toString() === this.value.toString();
    }

    contains(object) {
        return object[this.property].toString().includes(this.value.toString());
    }

    and(object) {
        return this.value.every(value => value.check(object));
    }

    or(object) {
        return this.value.some(value => value.check(object));
    }
}
export default Condition;
