import should from 'should';

// eslint-disable-next-line import/named
import { makeUrlPrefixRegExp } from '../../server/helpers';

describe('makeUrlPrefix', () => {
    it('when the url prefix is / all the urls should match ', () => {
        let regExp = makeUrlPrefixRegExp('/');
        regExp.test('/').should.equal(true);
        regExp.test('/transactions').should.equal(true);
        regExp.test('/transactions/anId').should.equal(true);
    });
    it('when the url prefix is /apps/kresus only /apps/kresus/* should match', () => {
        let regExp = makeUrlPrefixRegExp('/apps/kresus');
        regExp.test('/').should.equal(false);
        regExp.test('/apps').should.equal(false);
        regExp.test('/transactions').should.equal(false);
        regExp.test('/apps/kresus').should.equal(true);
        regExp.test('/apps/kresus/').should.equal(true);
        regExp.test('/apps/kresus/transactions').should.equal(true);
        regExp.test('/apps/kresus/transactions/anId').should.equal(true);
    });
});
