'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.update = exports.destroy = exports.create = exports.loadAlert = undefined;

let loadAlert = exports.loadAlert = (() => {
    var _ref = _asyncToGenerator(function* (req, res, next, alertId) {
        try {
            let alert = yield _alert2.default.find(alertId);
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

    return function loadAlert(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
    };
})();

let create = exports.create = (() => {
    var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
            let newAlert = req.body;
            if (!newAlert || typeof newAlert.accountId !== 'string' || typeof newAlert.type !== 'string') {
                throw new _helpers.KError('missing parameters', 400);
            }

            let validationError = (0, _validators.checkAlert)(newAlert);
            if (validationError) {
                throw new _helpers.KError(validationError, 400);
            }

            let account = yield _account2.default.find(newAlert.accountId);
            if (!account) {
                throw new _helpers.KError('bank account not found', 404);
            }

            let alert = yield _alert2.default.create(newAlert);
            res.status(201).json(alert);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when creating an alert');
        }
    });

    return function create(_x5, _x6) {
        return _ref2.apply(this, arguments);
    };
})();

let destroy = exports.destroy = (() => {
    var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
            yield req.preloaded.alert.destroy();
            res.status(204).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when deleting a bank alert');
        }
    });

    return function destroy(_x7, _x8) {
        return _ref3.apply(this, arguments);
    };
})();

let update = exports.update = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
            let newAlert = req.body;

            if (typeof newAlert.type !== 'undefined') {
                throw new _helpers.KError("can't update an alert type", 400);
            }

            newAlert = Object.assign(req.preloaded.alert, newAlert);

            let validationError = (0, _validators.checkAlert)(newAlert);
            if (validationError) {
                throw new _helpers.KError(validationError, 400);
            }

            newAlert = yield req.preloaded.alert.updateAttributes(req.body);
            res.status(200).json(newAlert);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when updating a bank alert');
        }
    });

    return function update(_x9, _x10) {
        return _ref4.apply(this, arguments);
    };
})();

var _account = require('../../models/account');

var _account2 = _interopRequireDefault(_account);

var _alert = require('../../models/alert');

var _alert2 = _interopRequireDefault(_alert);

var _helpers = require('../../helpers');

var _validators = require('../../shared/validators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }