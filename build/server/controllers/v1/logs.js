"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLogs = getLogs;
exports.clearLogs = clearLogs;

var _fs = _interopRequireDefault(require("fs"));

var _accesses = _interopRequireDefault(require("../../models/accesses"));

var _accounts = _interopRequireDefault(require("../../models/accounts"));

var _helpers = require("../../helpers");

var _helpers2 = require("./helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const readFile = (0, _helpers.promisify)(_fs.default.readFile);
const writeFile = (0, _helpers.promisify)(_fs.default.writeFile);

function getLogs(_x, _x2) {
  return _getLogs.apply(this, arguments);
}

function _getLogs() {
  _getLogs = _asyncToGenerator(function* (req, res) {
    try {
      let userId = req.user.id;
      let logs = yield readFile(process.kresus.logFilePath, 'utf-8');
      let sensitiveKeywords = new Set();
      let passwords = new Set();
      const accounts = yield _accounts.default.all(userId);
      accounts.forEach(acc => {
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
      const accesses = yield _accesses.default.all(userId);
      accesses.forEach(acc => {
        if (acc.login) {
          sensitiveKeywords.add(acc.login);
        }

        if (acc.password) {
          passwords.add(acc.password);
        }
      });
      logs = (0, _helpers2.obfuscateKeywords)(logs, sensitiveKeywords);
      logs = (0, _helpers2.obfuscatePasswords)(logs, passwords);
      res.status(200).type('text/plain').send(logs);
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, `when reading logs from ${process.kresus.logFilePath}`);
    }
  });
  return _getLogs.apply(this, arguments);
}

function clearLogs(_x3, _x4) {
  return _clearLogs.apply(this, arguments);
}

function _clearLogs() {
  _clearLogs = _asyncToGenerator(function* (req, res) {
    try {
      yield writeFile(process.kresus.logFilePath, '');
      res.status(200).end();
    } catch (err) {
      return (0, _helpers.asyncErr)(res, err, 'when clearing logs');
    }
  });
  return _clearLogs.apply(this, arguments);
}