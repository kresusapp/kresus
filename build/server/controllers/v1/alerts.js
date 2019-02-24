"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadAlert = loadAlert;
exports.create = create;
exports.destroy = destroy;
exports.update = update;

var _accounts = _interopRequireDefault(require("../../models/accounts"));

var _alerts = _interopRequireDefault(require("../../models/alerts"));

var _helpers = require("../../helpers");

var _validators = require("../../shared/validators");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function loadAlert(_x, _x2, _x3, _x4) {
  return _loadAlert.apply(this, arguments);
}

function _loadAlert() {
  _loadAlert = _asyncToGenerator(function* (req, res, next, alertId) {
    try {
      let userId = req.user.id;
      let alert = yield _alerts.default.find(userId, alertId);

      if (!alert) {
        throw new _helpers.KError('bank alert not found', 404);
      }

      req.preloaded = req.preloaded || {};
      req.preloaded.alert = alert;
      return next();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when preloading alert');
    }
  });
  return _loadAlert.apply(this, arguments);
}

function create(_x5, _x6) {
  return _create.apply(this, arguments);
}

function _create() {
  _create = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let newAlert = req.body;

      if (!newAlert || typeof newAlert.accountId !== 'string' || typeof newAlert.type !== 'string') {
        throw new _helpers.KError('missing parameters', 400);
      }

      let validationError = (0, _validators.checkAlert)(newAlert);

      if (validationError) {
        throw new _helpers.KError(validationError, 400);
      }

      let account = yield _accounts.default.find(userId, newAlert.accountId);

      if (!account) {
        throw new _helpers.KError('bank account not found', 404);
      }

      let alert = yield _alerts.default.create(userId, newAlert);
      res.status(201).json(alert);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when creating an alert');
    }
  });
  return _create.apply(this, arguments);
}

function destroy(_x7, _x8) {
  return _destroy.apply(this, arguments);
}

function _destroy() {
  _destroy = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      yield _alerts.default.destroy(userId, req.preloaded.alert.id);
      res.status(204).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when deleting a bank alert');
    }
  });
  return _destroy.apply(this, arguments);
}

function update(_x9, _x10) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let alert = req.preloaded.alert;
      let newAlert = req.body;

      if (typeof newAlert.type !== 'undefined') {
        throw new _helpers.KError("can't update an alert type", 400);
      }

      newAlert = Object.assign({}, alert, newAlert);
      let validationError = (0, _validators.checkAlert)(newAlert);

      if (validationError) {
        throw new _helpers.KError(validationError, 400);
      }

      newAlert = yield _alerts.default.update(userId, alert.id, req.body);
      res.status(200).json(newAlert);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when updating a bank alert');
    }
  });
  return _update.apply(this, arguments);
}