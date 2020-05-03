import should from 'should';

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
        hasMissingField(objectToCheck, listOfProps.concat(['prop3'])).should.be.type('string');
    });
    it('should return null if the list of properties of the object and the list of property names match.', () => {
        should.equal(hasMissingField(objectToCheck, listOfProps), null);
    });
    it('should return null if the list of properties of the object includes the list of property names.', () => {
        const objectToCheck2 = { ...objectToCheck, prop3: 'prop3' };
        should.equal(hasMissingField(objectToCheck2, listOfProps), null);
    });
});

describe('hasForbiddenField', () => {
    it('should return an error description if the list of properties of the object includes the list of property names.', () => {
        const objectToCheck2 = { ...objectToCheck, prop3: 'prop3' };
        hasForbiddenField(objectToCheck2, listOfProps).should.be.type('string');
    });
    it('should return null if the list of properties of the object and the list of property names match.', () => {
        should.equal(hasForbiddenField(objectToCheck, listOfProps), null);
    });
    it('should return null if the object misses a field.', () => {
        should.equal(hasForbiddenField(objectToCheck, listOfProps.concat(['prop3'])), null);
    });
});

describe('hasForbiddenOrMissingField', () => {
    it('should return an error description if the list of properties of the object exactly matches the list of allowed names.', () => {
        const objectToCheck2 = { ...objectToCheck, prop3: 'prop3' };
        hasForbiddenOrMissingField(objectToCheck2, listOfProps).should.be.type('string');
    });
    it('should return an error description if the object misses a field.', () => {
        hasForbiddenOrMissingField(objectToCheck, listOfProps.concat(['prop3'])).should.be.type(
            'string'
        );
    });
    it('should return null if the list of properties of the object and the list of property names match.', () => {
        should.equal(hasForbiddenOrMissingField(objectToCheck, listOfProps), null);
    });
});
