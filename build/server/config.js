'use strict';

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _americano = require('americano');

var _americano2 = _interopRequireDefault(_americano);

var _cozyI18nHelper = require('cozy-i18n-helper');

var _cozyI18nHelper2 = _interopRequireDefault(_cozyI18nHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var nodeEnv = process.env.NODE_ENV;
process.kresus = process.kresus || {};
process.kresus.prod = typeof nodeEnv !== 'undefined' && ['production', 'prod'].indexOf(nodeEnv) !== -1;
process.kresus.dev = !process.kresus.prod;
process.kresus.standalone = process.kresus.standalone || false;

var ROOT = process.env.KRESUS_URL_PREFIX;

var common = [_americano2.default.bodyParser({ limit: '10mb' }), _americano2.default.methodOverride(), _americano2.default.errorHandler({
    dumpExceptions: true,
    showStack: true
}), _americano2.default.static(path.join(__dirname, '..', 'client'), {
    maxAge: 86400000
}), _cozyI18nHelper2.default.middleware];

if (typeof ROOT === 'string' && ROOT.length) {
    // If there's a root, add a middleware that removes it from incoming URLs
    // if it appears in a prefix position.

    var root = path.posix.resolve('/', ROOT);
    var rootRegexp = new RegExp('^' + root + '/?');

    var removePrefix = function removePrefix(req, res, next) {
        req.url = req.url.replace(rootRegexp, '/');
        return next();
    };

    common.splice(0, 0, removePrefix);
}

// Config is loaded from americano, which doesn't support babel default export.
module.exports = {
    common: common,

    development: [_americano2.default.logger('dev')],

    production: [_americano2.default.logger('short')],

    plugins: ['cozydb']
};