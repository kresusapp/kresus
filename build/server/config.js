'use strict';

var _pathExtra = require('path-extra');

var path = _interopRequireWildcard(_pathExtra);

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

// Config is loaded from americano, which doesn't support babel default export.
module.exports = {
    common: [_americano2.default.bodyParser({ limit: '10mb' }), _americano2.default.methodOverride(), _americano2.default.errorHandler({
        dumpExceptions: true,
        showStack: true
    }), _americano2.default.static(path.join(__dirname, '..', 'client'), {
        maxAge: 86400000
    }), _cozyI18nHelper2.default.middleware],

    development: [_americano2.default.logger('dev')],

    production: [_americano2.default.logger('short')],

    plugins: ['cozydb']
};