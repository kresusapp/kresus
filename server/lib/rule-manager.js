// List of possible promise predicates
const promisePredicates = [
// Does not contain
    '$nct',
// Contains
    '$ct',
// Greater than
    '$gt',
// Greater than or equal
    '$gte',
// Lower than
    '$lt',
// Lower than or equal
    '$lte',
// equal
    '$eq',
// not equal
    '$neq'
];


// List of possible action predicates
const actionPredicates = [
// Set a property
    '$set',
// Append a string at the end of property
    '$ape',
// Append a string at the beginning of property
    '$apb'
];
/*
    A rule has this struscture: 
    { promise: { property: { predicate: value }}, actions: [{ property: { predicate: value } }] }
*/

class Rule {
    constructor(promise) {
        this.decode(promise);
    }

    run(object) {
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
            case '$gte':
                result = !this.lower(object);
                break;
            case '$lt':
                result = this.lower(object);
                break;
            case '$lte':
                result = !this.greater(object);
                break;
            case '$eq':
                result = this.equal(object);
                break;
            case '$neq':
                result = !this.equal(object);
                break;
            default:
                throw new Error(`Invalid predicate: ${this.predicate}`);
        }
        return result;
    }

    decodePromise(promise) {

        /*
        The promise should have the following pattern :
        { property: { predicate: value } }
        */

        if (Object.keys(promise).length !== 1) {
            throw new Error('A promise should have one and only one property');
        }
        this.property = Object.keys(promise)[0];

        let test = promise[this.property];

        if (Object.keys(test).length !== 1) {
            throw new Error('A promise should be of type { property: { predicate: value } }');
        }

        this.predicate = Object.keys(test)[0];
        if (promisePredicates.indexOf(this.predicate) === -1) {
            throw new Error(`${this.predicate} is not a valid value for a predicate.`);
        }
        this.value = test[this.predicate];
    }

    greater(object) {
        if (!object.hasOwnProperty(this.property)) {
            return false;
        }

        if (isNaN(parseFloat(object[this.property])) ||
            isNaN(parseFloat(this.value))) {
            throw new Error(`${object[this.property]} and value ${this.value} should be numbers`);
        }
        return object[this.property] > this.value;
    }

    lower(object) {
        if (!object.hasOwnProperty(this.property)) {
            return false;
        }
        if (isNaN(parseFloat(object[this.property])) ||
            isNaN(parseFloat(this.value))) {
            throw new Error(`${object[this.property]} and value ${this.value} should be numbers`);
        }
        return object[this.property] < this.value;
    }

    equal(object) {
        if (!object.hasOwnProperty(this.property)) {
            return false;
        }
        return object[this.property] === this.value ||
               object[this.property].toString() === this.value.toString();
    }

    contains(object) {
        if (!object.hasOwnProperty(this.property)) {
            return false;
        }
        return object[this.property].toString().includes(this.value.toString());
    }

    action(action, property, value, object) {
        let newObject;
        switch (action) {
            case '$set':
                newObject = this.set(operation, property, value);
                break;
            case '$ape':
                newObject = this.appendEnd(operation, property, value);
                break;
            case '$apb':
                newObject = this.appendBefore(operation, property, value);
                break;
            default: 
                throw new Error(`Unkown action: ${action}`);
            
        }
        return newObject;
    }
}
export default Rule;
