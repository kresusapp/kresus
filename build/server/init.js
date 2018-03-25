'use strict';

var _helpers = require('./helpers');

var _migrations = require('./models/migrations');

var Migrations = _interopRequireWildcard(_migrations);

var _config = require('./models/config');

var Settings = _interopRequireWildcard(_config);

var _poller = require('./lib/poller');

var _poller2 = _interopRequireDefault(_poller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('init');

// See comment in index.js.
module.exports = _asyncToGenerator(function* () {
    try {
        // Localize Kresus
        let locale = yield Settings.getLocale();
        (0, _helpers.setupTranslator)(locale);

        // Do data migrations first
        log.info('Applying data migrations...');
        yield Migrations.run();
        log.info('Done running data migrations.');

        // Start bank polling
        log.info('Starting bank accounts polling et al...');
        yield _poller2.default.runAtStartup();

        log.info("Server is ready, let's start the show!");
    } catch (err) {
        log.error(`Error at initialization:
Message: ${err.message}
${err.stack}`);
    }
});