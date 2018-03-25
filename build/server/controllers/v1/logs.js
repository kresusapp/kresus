'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getLogs = undefined;

let getLogs = exports.getLogs = (() => {
    var _ref = _asyncToGenerator(function* (req, res) {
        try {
            let logs = yield readLogs(process.kresus.logFilePath, 'utf-8');
            let sensitiveKeywords = new Set();
            let passwords = new Set();

            const accounts = yield _account2.default.all();
            accounts.forEach(function (acc) {
                if (acc.bankAccess) {
                    sensitiveKeywords.add(acc.bankAccess);
                }

                if (acc.accountNumber) {
                    sensitiveKeywords.add(acc.accountNumber);
                }

                if (acc.iban) {
                    sensitiveKeywords.add(acc.iban);
                }
            });

            const accesses = yield _access2.default.all();
            accesses.forEach(function (acc) {
                if (acc.login) {
                    sensitiveKeywords.add(acc.login);
                }

                if (acc.password) {
                    passwords.add(acc.password);
                }
            });

            logs = obfuscateKeywords(logs, sensitiveKeywords);
            logs = obfuscatePasswords(logs, passwords);

            res.status(200).type('text/plain').send(logs);
        } catch (err) {
            return (0, _helpers.asyncErr)(res, err, `when reading logs from ${process.kresus.logFilePath}`);
        }
    });

    return function getLogs(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

exports.obfuscatePasswords = obfuscatePasswords;
exports.obfuscateKeywords = obfuscateKeywords;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _regexEscape = require('regex-escape');

var _regexEscape2 = _interopRequireDefault(_regexEscape);

var _access = require('../../models/access');

var _access2 = _interopRequireDefault(_access);

var _account = require('../../models/account');

var _account2 = _interopRequireDefault(_account);

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const readLogs = (0, _helpers.promisify)(_fs2.default.readFile);

function obfuscatePasswords(string, passwords) {
    // Prevents the application of the regexp s//*******/g
    if (!passwords.size) {
        return string;
    }

    const regex = [...passwords].map(k => (0, _regexEscape2.default)(k)).join('|');

    // Always return a fixed width string
    return string.replace(new RegExp(`(${regex})`, 'gm'), '********');
}

function obfuscateKeywords(string, keywords) {
    // Prevents the application of the regexp s//*******/g
    if (!keywords.size) {
        return string;
    }
    const regex = [...keywords].map(k => (0, _regexEscape2.default)(k)).join('|');
    return string.replace(new RegExp(`(${regex})`, 'gm'), (all, keyword) => keyword.substr(-3).padStart(keyword.length, '*'));
}