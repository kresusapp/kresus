'use strict';

var _cozydb = require('cozydb');

var cozydb = _interopRequireWildcard(_cozydb);

var _helpers = require('../helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('models/access');

let Access = cozydb.getModel('bankaccess', {
    // External (backend) unique identifier.
    bank: String,

    // Credentials to connect to the bank's website.
    login: String,
    password: String,

    // Any supplementary fields necessary to connect to the bank's website.
    customFields: {
        type: String,
        default: '[]'
    },

    // Text status indicating whether the last poll was successful or not.
    fetchStatus: {
        type: String,
        default: 'OK'
    },

    // Boolean indicating if the access is enabled or not.
    enabled: {
        type: Boolean,
        default: true
    },

    // ************************************************************************
    // DEPRECATED.
    // ************************************************************************
    website: String,
    _passwordStillEncrypted: Boolean
});

Access = (0, _helpers.promisifyModel)(Access);

let request = (0, _helpers.promisify)(Access.request.bind(Access));

Access.byBank = (() => {
    var _ref = _asyncToGenerator(function* (bank) {
        if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
            log.warn('Access.byBank misuse: bank must be a Bank instance.');
        }

        let params = {
            key: bank.uuid
        };
        return yield request('allByBank', params);
    });

    function byBank(_x) {
        return _ref.apply(this, arguments);
    }

    return byBank;
})();

Access.allLike = (() => {
    var _ref2 = _asyncToGenerator(function* (access) {
        if (typeof access !== 'object' || typeof access.bank !== 'string' || typeof access.login !== 'string' || typeof access.password !== 'string') {
            log.warn('Access.allLike misuse: access must be an Access instance.');
        }

        let params = {
            key: [access.bank, access.login, access.password]
        };
        return yield request('allLike', params);
    });

    function allLike(_x2) {
        return _ref2.apply(this, arguments);
    }

    return allLike;
})();

// Sync function
Access.prototype.hasPassword = function () {
    return (typeof this._passwordStillEncrypted === 'undefined' || !this._passwordStillEncrypted) && typeof this.password !== 'undefined';
};

// Can the access be polled
Access.prototype.canBePolled = function () {
    return this.enabled && this.fetchStatus !== 'INVALID_PASSWORD' && this.fetchStatus !== 'EXPIRED_PASSWORD' && this.fetchStatus !== 'INVALID_PARAMETERS' && this.fetchStatus !== 'NO_PASSWORD' && this.fetchStatus !== 'ACTION_NEEDED';
};

module.exports = Access;