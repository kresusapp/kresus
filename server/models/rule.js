import * as americano from 'cozydb';
import { makeLogger, promisify, promisifyModel } from '../helpers';

// List of operation fields on which it is possible to build a promiss
// Export to shared/smth
const promissFields = [
    'title',
    'amount',
    'date',
    'operationTypeID',
    'raw',
];
// TODO : Export to shared/smthimg


// TODO : Export to helpers.
checkObjectProperties = function(object, propertyList) {
    // Check that the object has all the appripriate properties
    for (let property of propertyList) {
        if (!object.hasOwnProperty(property)) {
         throw new KError(`Object should have property: ${property}`);
        }
    }
    // Check that the object has no other property
    for (let property in object) {
        if (propertyList.indexOf(property) === -1) {
            throw new KError(`Object should not have property ${property}`);
        };
    }
}
/*
class RulePromiss {
    constructor(field, predicate, value) {
        this.field = field;
        this.predicate = predicate;
        this.value = value;
        console.log("Done");
    }
}*/

/* 

Promiss format :
{ property: { predicate: value }

property: property of the object on which the test is done 
predicate: test done on the object
value: value against which the property of the object is tested

*/




let log = makeLogger('models/rule');

let Rule = americano.getModel('bankrule', {
    // Priority of the rule. Rules are applied in order of priority, the smaller the more prioritary
    priority: Number,
    promisses: x => x,
    enabled: Boolean,
});

Rule.checkPromisses = function(rule) {
    // As promisses are declared as binaries, couchdb does not check they are correctly formed

    if (rule.promisses &&
        typeof rule.promisses !== 'string'&&
        rule.promisses.length) {
        for (let promiss of rule.promisses) {
            // Check the promiss has the appropriate structure 
            if (!checkObjectProperties(promiss, promissProperties) ||
                promissFields.indexOf(promiss.field) === -1 ||
                predicates.indexOf(promiss.predicate) === -1
                ) {
                throw new KError('malformed promiss');
            }
        }
    } else {
        throw new KError('promisses should be present in a rule object')
    }
}

Rule = promisifyModel(Rule);

module.exports = Rule;
