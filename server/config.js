import * as path from 'path';

import americano from 'americano';
import i18n from 'cozy-i18n-helper';

const nodeEnv = process.env.NODE_ENV;
process.kresus = process.kresus || {};
process.kresus.prod = typeof nodeEnv !== 'undefined' &&
                      ['production', 'prod'].indexOf(nodeEnv) !== -1;
process.kresus.dev = !process.kresus.prod;
process.kresus.standalone = process.kresus.standalone || false;
process.kresus.urlPrefix = path.posix.resolve('/', process.env.KRESUS_URL_PREFIX || '');

let common = [
    americano.bodyParser({ limit: '10mb' }),
    americano.methodOverride(),
    americano.errorHandler({
        dumpExceptions: true,
        showStack: true
    }),
    americano.static(path.join(__dirname, '..', 'client'), {
        maxAge: 86400000
    }),
    i18n.middleware
];

function makeUrlPrefixRegExp(urlPrefix) {
    return new RegExp(`^${urlPrefix}/?`);
}

if (process.kresus.urlPrefix !== '/') {
    // If there's a url_prefix, add a middleware that removes it from incoming URLs
    // if it appears in a prefix position.
    let rootRegexp = makeUrlPrefixRegExp(process.kresus.urlPrefix);

    let removePrefix = (req, res, next) => {
        req.url = req.url.replace(rootRegexp, '/');
        return next();
    };

    common.splice(0, 0, removePrefix);
}

// ******************************** TEST **************************************
function testMakeUrlPrefixRegExp(it) {
    it('when the url prefix is / all the urls should match ', () => {
        let regExp = makeUrlPrefixRegExp('/');
        regExp.test('/').should.equal(true);
        regExp.test('/operations').should.equal(true);
        regExp.test('/operations/anId').should.equal(true);
    });
    it('when the url prefix is /apps/kresus only /apps/kresus/* should match', () => {
        let regExp = makeUrlPrefixRegExp('/apps/kresus');
        regExp.test('/').should.equal(false);
        regExp.test('/apps').should.equal(false);
        regExp.test('/operations').should.equal(false);
        regExp.test('/apps/kresus').should.equal(true);
        regExp.test('/apps/kresus/').should.equal(true);
        regExp.test('/apps/kresus/operations').should.equal(true);
        regExp.test('/apps/kresus/operations/anId').should.equal(true);
    });
}

// ******************************** EXPORTS **************************************
// Config is loaded from americano, which doesn't support babel default export.
module.exports = {
    common,

    development: [
        americano.logger('dev')
    ],

    production: [
        americano.logger('short')
    ],

    plugins: [
        'cozydb'
    ],

    testMakeUrlPrefixRegExp
};
