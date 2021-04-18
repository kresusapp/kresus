import should from 'should';

import { capitalize } from '../../client/helpers';

describe('client helpers', () => {
    describe('capitalize', () => {
        it('should set the first letter of a sentence in uppercase', () => {
            capitalize('april').should.equal('April');
            capitalize('élément').should.equal('Élément');
        });

        it('should not alter other letters or following words', () => {
            capitalize('april month').should.equal('April month');
            capitalize('APRIL').should.equal('APRIL');
            capitalize('aPrIL').should.equal('APrIL');
        });

        it('should return an empty string if provided an empty or invalid text', () => {
            capitalize('').should.equal('');
            capitalize(null).should.equal('');
            capitalize({}).should.equal('');
            capitalize().should.equal('');
        });
    });
});
