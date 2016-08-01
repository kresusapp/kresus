// List of possible action predicates
const actionPredicates = [
// Set a property
    '$set',
// Append a string at the end of property
    '$ape',
// Append a string at the beginning of property
    '$apb'
];


// A rule should bue of structure :
// { property: { predicate: value }

class Action {
    constructor(action) {

        /*
        The action should have the following pattern :
        { property: { predicate: value } }
        */

        if (Object.keys(action).length !== 1) {
            throw new Error('A action should have one and only one property');
        }
        this.property = Object.keys(action)[0];

        let test = action[this.property];

        if (Object.keys(test).length !== 1) {
            throw new Error('A action should be of type { property: { predicate: value } }');
        }

        this.predicate = Object.keys(test)[0];
        if (actionPredicates.indexOf(this.predicate) === -1) {
            throw new Error(`${this.predicate} is not a valid value for a predicate.`);
        }
        this.value = test[this.predicate];
    }

    act(object) {
        let newObject;
        switch (this.action) {
            case '$set':
                newObject = this.set(object);
                break;
            case '$ape':
                newObject = this.appendEnd(object);
                break;
            case '$apb':
                newObject = this.appendBefore(object);
                break;
            default:
                throw new Error(`Unkown action: ${this.action}`);
        }
        return newObject;
    }

    set(object) {
        object[this.property] = this.value;
        return object;
    }

    appendEnd(object) {
        if (!object.hasOwnProperty(this.property)) {
            throw new Error(`Object should have property ${this.property} `);
        }
        if (typeof object[this.property] !== 'string') {
            throw new Error(`Property ${this.property} of object should be a string`);
        }
        object[this.property] += this.value;
        return object;
    }

    appendBefore(object) {
        if (!object.hasOwnProperty(this.property)) {
            throw new Error(`Object should have property ${this.property} `);
        }
        if (typeof object[this.property] !== 'string') {
            throw new Error(`Property ${this.property} of object should be a string`);
        }
        object[this.property] = this.value + object[this.property];
        return object;
    }
}

export default Action;
