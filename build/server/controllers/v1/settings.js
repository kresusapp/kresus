'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testEmail = exports.updateWeboob = exports.getWeboobVersion = exports.save = undefined;

let save = exports.save = (() => {
    var _ref = _asyncToGenerator(function* (req, res) {
        try {
            let pair = req.body;

            if (typeof pair.key === 'undefined') {
                throw new _helpers.KError('Missing key when saving a setting', 400);
            }
            if (typeof pair.value === 'undefined') {
                throw new _helpers.KError('Missing value when saving a setting', 400);
            }

            let found = yield _config2.default.findOrCreateByName(pair.key, pair.value);
            if (found.value !== pair.value) {
                found.value = pair.value;
                yield found.save();
            }

            postSave(pair.key, pair.value);

            res.status(200).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when saving a setting');
        }
    });

    return function save(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

let getWeboobVersion = exports.getWeboobVersion = (() => {
    var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
            const version = yield weboob.getVersion( /* force = */true);
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

    return function getWeboobVersion(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
})();

let updateWeboob = exports.updateWeboob = (() => {
    var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
            yield weboob.updateWeboobModules();
            res.status(200).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when updating weboob');
        }
    });

    return function updateWeboob(_x5, _x6) {
        return _ref3.apply(this, arguments);
    };
})();

let testEmail = exports.testEmail = (() => {
    var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
            let email = req.body.email;

            if (!email) {
                throw new _helpers.KError('Missing email recipient address when sending a test email', 400);
            }
            yield _emailer2.default.sendTestEmail(email);
            res.status(200).end();
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, 'when trying to send an email');
        }
    });

    return function testEmail(_x7, _x8) {
        return _ref4.apply(this, arguments);
    };
})();

var _config = require('../../models/config');

var _config2 = _interopRequireDefault(_config);

var _weboob = require('../../lib/sources/weboob');

var weboob = _interopRequireWildcard(_weboob);

var _emailer = require('../../lib/emailer');

var _emailer2 = _interopRequireDefault(_emailer);

var _errors = require('../../shared/errors.json');

var _helpers = require('../../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function postSave(key, value) {
    switch (key) {
        case 'email-recipient':
            _emailer2.default.forceReinit(value);
            break;
        case 'locale':
            (0, _helpers.setupTranslator)(value);
            break;
        default:
            break;
    }
}