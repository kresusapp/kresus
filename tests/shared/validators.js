import assert from 'node:assert';

import {
    hasMissingField,
    hasForbiddenField,
    hasForbiddenOrMissingField,
} from '../../shared/validators';

const objectToCheck = {
    prop1: 'test',
    prop2: 'prop2',
};

const listOfProps = Object.keys(objectToCheck);

describe('hasMissingField', () => {
    it('should return an error description if the object misses a field.', () => {
        assert.strictEqual(
            typeof hasMissingField(objectToCheck, listOfProps.concat(['prop3'])),
            'string'
        );
    });
    it('should return null if the list of properties of the object and the list of property names match.', () => {
        assert.strictEqual(hasMissingField(objectToCheck, listOfProps), null);
    });
    it('should return null if the list of properties of the object includes the list of property names.', () => {
        const objectToCheck2 = { ...objectToCheck, prop3: 'prop3' };
        assert.strictEqual(hasMissingField(objectToCheck2, listOfProps), null);
    });
});

describe('hasForbiddenField', () => {
    it('should return an error description if the list of properties of the object includes the list of property names.', () => {
        const objectToCheck2 = { ...objectToCheck, prop3: 'prop3' };
        assert.strictEqual(typeof hasForbiddenField(objectToCheck2, listOfProps), 'string');
    });
    it('should return null if the list of properties of the object and the list of property names match.', () => {
        assert.strictEqual(hasForbiddenField(objectToCheck, listOfProps), null);
    });
    it('should return null if the object misses a field.', () => {
        assert.strictEqual(hasForbiddenField(objectToCheck, listOfProps.concat(['prop3'])), null);
    });
});

describe('hasForbiddenOrMissingField', () => {
    it('should return an error description if the list of properties of the object exactly matches the list of allowed names.', () => {
        const objectToCheck2 = { ...objectToCheck, prop3: 'prop3' };
        assert.strictEqual(
            typeof hasForbiddenOrMissingField(objectToCheck2, listOfProps),
            'string'
        );
    });
    it('should return an error description if the object misses a field.', () => {
        assert.strictEqual(
            typeof hasForbiddenOrMissingField(objectToCheck, listOfProps.concat(['prop3'])),
            'string'
        );
    });
    it('should return null if the list of properties of the object and the list of property names match.', () => {
        assert.strictEqual(hasForbiddenOrMissingField(objectToCheck, listOfProps), null);
    });
});
