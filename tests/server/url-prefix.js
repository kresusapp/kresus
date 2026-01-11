import assert from 'node:assert';

// eslint-disable-next-line import/named
import { makeUrlPrefixRegExp } from '../../server/helpers';

describe('makeUrlPrefix', () => {
    it('when the url prefix is / all the urls should match ', () => {
        let regExp = makeUrlPrefixRegExp('/');
        assert.ok(regExp.test('/'));
        assert.ok(regExp.test('/transactions'));
        assert.ok(regExp.test('/transactions/anId'));
    });
    it('when the url prefix is /apps/kresus only /apps/kresus/* should match', () => {
        let regExp = makeUrlPrefixRegExp('/apps/kresus');
        assert.ok(!regExp.test('/'));
        assert.ok(!regExp.test('/apps'));
        assert.ok(!regExp.test('/transactions'));
        assert.ok(regExp.test('/apps/kresus'));
        assert.ok(regExp.test('/apps/kresus/'));
        assert.ok(regExp.test('/apps/kresus/transactions'));
        assert.ok(regExp.test('/apps/kresus/transactions/anId'));
    });
});
