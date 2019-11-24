"use strict";

var _helpers = require("./helpers");

var _models = _interopRequireDefault(require("./models"));

var Migrations = _interopRequireWildcard(require("./models/migrations"));

var Settings = _interopRequireWildcard(require("./models/settings"));

var _poller = _interopRequireDefault(require("./lib/poller"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('init'); // Checks if the demo mode is enabled, and set it up if that's the case.

function checkDemoMode() {
  return _checkDemoMode.apply(this, arguments);
} // See comment in index.js.


function _checkDemoMode() {
  _checkDemoMode = _asyncToGenerator(function* () {
    if (process.kresus.forceDemoMode) {
      let isDemoModeEnabled = yield Settings.findOrCreateDefaultBooleanValue(0, 'demo-mode');

      if (!isDemoModeEnabled) {
        try {
          log.info('Setting up demo mode...');

          let demoController = require('./controllers/v1/demo');

          yield demoController.setupDemoMode(0);
          log.info('Done setting up demo mode...');
        } catch (err) {
          log.error(`Fatal error when setting up demo mode : ${err.message}
${err.stack}`);
        }
      }
    }
  });
  return _checkDemoMode.apply(this, arguments);
}

module.exports =
/*#__PURE__*/
_asyncToGenerator(function* () {
  try {
    // Initialize models.
    yield (0, _models.default)();
    yield checkDemoMode(); // Localize Kresus
    // TODO : do not localize Kresus globally when Kresus is multi-user.

    let locale = yield Settings.getLocale(process.kresus.user.id);
    (0, _helpers.setupTranslator)(locale); // Do data migrations first

    log.info('Applying data migrations...');
    yield Migrations.run();
    log.info('Done running data migrations.'); // Start bank polling

    log.info('Starting bank accounts polling et al...');
    yield _poller.default.runAtStartup();
    log.info("Server is ready, let's start the show!");
  } catch (err) {
    log.error(`Error at initialization:
Message: ${err.message}
${err.stack}`);
  }
});