"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.save = save;
exports.getWeboobVersion = getWeboobVersion;
exports.updateWeboob = updateWeboob;
exports.testEmail = testEmail;

var _settings = _interopRequireDefault(require("../../models/settings"));

var weboob = _interopRequireWildcard(require("../../lib/sources/weboob"));

var _emailer = _interopRequireDefault(require("../../lib/emailer"));

var _errors = require("../../shared/errors.json");

var _helpers = require("../../helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function postSave(key, value) {
  switch (key) {
    case 'email-recipient':
      _emailer.default.forceReinit(value);

      break;

    case 'locale':
      (0, _helpers.setupTranslator)(value);
      break;

    default:
      break;
  }
}

function save(_x, _x2) {
  return _save.apply(this, arguments);
}

function _save() {
  _save = _asyncToGenerator(function* (req, res) {
    try {
      let pair = req.body;

      if (typeof pair.key === 'undefined') {
        throw new _helpers.KError('Missing key when saving a setting', 400);
      }

      if (typeof pair.value === 'undefined') {
        throw new _helpers.KError('Missing value when saving a setting', 400);
      }

      let userId = req.user.id;
      yield _settings.default.updateByKey(userId, pair.key, pair.value);
      postSave(pair.key, pair.value);
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when saving a setting');
    }
  });
  return _save.apply(this, arguments);
}

function getWeboobVersion(_x3, _x4) {
  return _getWeboobVersion.apply(this, arguments);
}

function _getWeboobVersion() {
  _getWeboobVersion = _asyncToGenerator(function* (req, res) {
    try {
      const version = yield weboob.getVersion(
      /* force = */
      true);

      if (version <= 0) {
        throw new _helpers.KError('cannot get weboob version', 500, _errors.WEBOOB_NOT_INSTALLED);
      }

      res.json({
        data: {
          version,
          isInstalled: (0, _helpers.checkWeboobMinimalVersion)(version)
        }
      });
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when getting weboob version');
    }
  });
  return _getWeboobVersion.apply(this, arguments);
}

function updateWeboob(_x5, _x6) {
  return _updateWeboob.apply(this, arguments);
}

function _updateWeboob() {
  _updateWeboob = _asyncToGenerator(function* (req, res) {
    try {
      yield weboob.updateWeboobModules();
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating weboob');
    }
  });
  return _updateWeboob.apply(this, arguments);
}

function testEmail(_x7, _x8) {
  return _testEmail.apply(this, arguments);
}

function _testEmail() {
  _testEmail = _asyncToGenerator(function* (req, res) {
    try {
      let email = req.body.email;

      if (!email) {
        throw new _helpers.KError('Missing email recipient address when sending a test email', 400);
      }

      yield _emailer.default.sendTestEmail(email);
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when trying to send an email');
    }
  });
  return _testEmail.apply(this, arguments);
}