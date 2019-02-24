import should from 'should';

import { normalizeVersion } from '../../server/helpers';

describe('normalizeVersion', () => {
    it('0 should become 0.0.0', () => {
        normalizeVersion(0).should.equal('0.0.0');
    });
    it('0.1 should become 0.1.0', () => {
        normalizeVersion(0.1).should.equal('0.1.0');
    });
    it('1 should become 1.0.0', () => {
        normalizeVersion('1').should.equal('1.0.0');
    });
    it('1.1.1.1 should become 1.1.1', () => {
        normalizeVersion('1.1.1.1').should.equal('1.1.1');
    });
    it('1.1.1 should be unchanged', () => {
        normalizeVersion('1.1.1').should.equal('1.1.1');
    });
    it('0.h should become 0.0.0', () => {
        normalizeVersion('0.h').should.equal('0.0.0');
    });
    it('1.2.4-beta.0 should be unchanged', () => {
        normalizeVersion('1.2.4-beta.0').should.equal('1.2.4-beta.0');
    });
    it('1.2.4-beta should be unchanged', () => {
        normalizeVersion('1.2.4-beta').should.equal('1.2.4-beta');
    });
});
