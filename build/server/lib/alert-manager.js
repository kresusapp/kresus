"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _emailer = _interopRequireDefault(require("./emailer"));

var _notifications = _interopRequireDefault(require("./notifications"));

var _accounts = _interopRequireDefault(require("../models/accounts"));

var _alerts = _interopRequireDefault(require("../models/alerts"));

var _settings = _interopRequireDefault(require("../models/settings"));

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('alert-manager');

class AlertManager {
  wrapContent(content) {
    return `${(0, _helpers.translate)('server.email.hello')}

${content}

${(0, _helpers.translate)('server.email.seeyoulater.notifications')},
${(0, _helpers.translate)('server.email.signature')}
`;
  }

  send(userId, {
    subject,
    text
  }) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _notifications.default.send(text); // Send email notification


      let content = _this.wrapContent(text);

      let fullSubject = `Kresus - ${subject}`;
      yield _emailer.default.sendToUser(userId, {
        subject: fullSubject,
        content
      });
      log.info('Notification sent.');
    })();
  }

  checkAlertsForOperations(userId, access, operations) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      try {
        let defaultCurrency = yield _settings.default.byName(userId, 'default-currency').value; // Map account to names

        let accounts = yield _accounts.default.byAccess(userId, access);
        let accountsMap = new Map();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = accounts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            let a = _step.value;
            accountsMap.set(a.id, {
              title: a.title,
              formatCurrency: _helpers.currency.makeFormat(a.currency || defaultCurrency)
            });
          } // Map accounts to alerts

        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        let alertsByAccount = new Map();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = operations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            let operation = _step2.value;
            // Memoize alerts by account
            let alerts;

            if (!alertsByAccount.has(operation.accountId)) {
              alerts = yield _alerts.default.byAccountAndType(userId, operation.accountId, 'transaction');
              alertsByAccount.set(operation.accountId, alerts);
            } else {
              alerts = alertsByAccount.get(operation.accountId);
            } // Skip operations for which the account has no alerts


            if (!alerts || !alerts.length) {
              continue;
            } // Set the account information


            let _accountsMap$get = accountsMap.get(operation.accountId),
                accountName = _accountsMap$get.title,
                formatCurrency = _accountsMap$get.formatCurrency;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = alerts[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                let alert = _step3.value;

                if (!alert.testTransaction(operation)) {
                  continue;
                }

                let text = alert.formatOperationMessage(operation, accountName, formatCurrency);
                yield _this2.send(userId, {
                  subject: (0, _helpers.translate)('server.alert.operation.title'),
                  text
                });
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } catch (err) {
        log.error(`Error when checking alerts for operations: ${err}`);
      }
    })();
  }

  checkAlertsForAccounts(userId, access) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      try {
        let defaultCurrency = yield _settings.default.byName(userId, 'default-currency').value;
        let accounts = yield _accounts.default.byAccess(userId, access);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = accounts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            let account = _step4.value;
            let alerts = yield _alerts.default.byAccountAndType(userId, account.id, 'balance');

            if (!alerts) {
              continue;
            }

            let balance = yield account.computeBalance();
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = alerts[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                let alert = _step5.value;

                if (!alert.testBalance(balance)) {
                  continue;
                } // Set the currency formatter


                let curr = account.currency || defaultCurrency;

                let formatCurrency = _helpers.currency.makeFormat(curr);

                let text = alert.formatAccountMessage((0, _helpers.displayLabel)(account), balance, formatCurrency);
                yield _this3.send(userId, {
                  subject: (0, _helpers.translate)('server.alert.balance.title'),
                  text
                });
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                  _iterator5.return();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      } catch (err) {
        log.error(`Error when checking alerts for accounts: ${err}`);
      }
    })();
  }

}

var _default = new AlertManager();

exports.default = _default;