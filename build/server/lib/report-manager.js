"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helpers = require("../helpers");

var _emailer = _interopRequireDefault(require("./emailer"));

var _accounts = _interopRequireDefault(require("../models/accounts"));

var _alerts = _interopRequireDefault(require("../models/alerts"));

var _transactions = _interopRequireDefault(require("../models/transactions"));

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('report-manager'); // Minimum duration between two reports: let T be any time, in the worst case,
// a report is sent at T + POLLER_START_HIGH_HOUR and the next one is sent at
// T + 24 + POLLER_START_LOW_HOUR.

const MIN_DURATION_BETWEEN_REPORTS = (24 + _helpers.POLLER_START_LOW_HOUR - _helpers.POLLER_START_HIGH_HOUR) * 60 * 60 * 1000;

class ReportManager {
  sendReport(userId, subject, content) {
    return _asyncToGenerator(function* () {
      yield _emailer.default.sendToUser(userId, {
        subject,
        content
      });
      log.info('Report sent.');
    })();
  }

  manageReports(userId) {
    var _this = this;

    return _asyncToGenerator(function* () {
      try {
        let now = (0, _moment.default)();
        yield _this.prepareReport(userId, 'daily');

        if (now.day() === 1) {
          yield _this.prepareReport(userId, 'weekly');
        }

        if (now.date() === 1) {
          yield _this.prepareReport(userId, 'monthly');
        }
      } catch (err) {
        log.warn(`Error when preparing reports: ${err}\n${err.stack}`);
      }
    })();
  }

  prepareReport(userId, frequencyKey) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      log.info(`Checking if user has enabled ${frequencyKey} report...`);
      let reports = yield _alerts.default.reportsByFrequency(userId, frequencyKey);

      if (!reports || !reports.length) {
        return log.info(`User hasn't enabled ${frequencyKey} report.`);
      }

      let now = (0, _moment.default)(); // Prevent two reports to be sent on the same day (in case of restart).

      reports = reports.filter(al => {
        return typeof al.lastTriggeredDate === 'undefined' || now.diff(al.lastTriggeredDate) >= MIN_DURATION_BETWEEN_REPORTS;
      });

      if (!reports || !reports.length) {
        return log.info('No report to send (already sent for this frequency).');
      }

      log.info('Report enabled and never sent, generating it...');
      let includedAccounts = reports.map(report => report.accountId);
      let accounts = yield _accounts.default.findMany(userId, includedAccounts);

      if (!accounts || !accounts.length) {
        throw new _helpers.KError("report's account does not exist");
      }

      let operationsByAccount = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = accounts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let a = _step.value;
          a.formatCurrency = yield a.getCurrencyFormatter();
          operationsByAccount.set(a.id, {
            account: a,
            operations: []
          });
        }
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

      let reportsMap = new Map();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = reports[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          let report = _step2.value;
          reportsMap.set(report.accountId, report);
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

      let operations = yield _transactions.default.byAccounts(userId, includedAccounts);
      let count = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = operations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          let operation = _step3.value;
          let accountId = operation.accountId;
          let report = reportsMap.get(accountId);

          let includeAfter = report.lastTriggeredDate || _this2.computeIncludeAfter(frequencyKey);

          includeAfter = (0, _moment.default)(includeAfter);
          let date = operation.importDate || operation.date;

          if ((0, _moment.default)(date).isAfter(includeAfter)) {
            if (!operationsByAccount.has(accountId)) {
              throw new _helpers.KError("operation's account does not exist");
            }

            operationsByAccount.get(accountId).operations.push(operation);
            ++count;
          }
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

      if (count) {
        let email = yield _this2.getTextContent(accounts, operationsByAccount, frequencyKey);
        let subject = email.subject,
            content = email.content;
        yield _this2.sendReport(userId, subject, content);
      } else {
        log.info('no operations to show in the report.');
      } // Update the last trigger even if there are no emails to send.


      let lastTriggeredDate = new Date();
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = reports[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          let report = _step4.value;
          yield _alerts.default.update(userId, report.id, {
            lastTriggeredDate
          });
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
    })();
  }

  getTextContent(accounts, operationsByAccount, frequencyKey) {
    return _asyncToGenerator(function* () {
      let frequency;

      switch (frequencyKey) {
        case 'daily':
          frequency = (0, _helpers.translate)('server.email.report.daily');
          break;

        case 'weekly':
          frequency = (0, _helpers.translate)('server.email.report.weekly');
          break;

        case 'monthly':
          frequency = (0, _helpers.translate)('server.email.report.monthly');
          break;

        default:
          log.error('unexpected frequency in getTextContent');
      }

      let today = _helpers.formatDate.toShortString();

      let content;
      content = (0, _helpers.translate)('server.email.hello');
      content += '\n\n';
      content += (0, _helpers.translate)('server.email.report.pre', {
        today
      });
      content += '\n';
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = accounts[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          let account = _step5.value;

          let lastCheckDate = _helpers.formatDate.toShortString(account.lastCheckDate);

          let balance = yield account.computeBalance();
          content += `\t* ${(0, _helpers.displayLabel)(account)} : `;
          content += `${account.formatCurrency(balance)} (`;
          content += (0, _helpers.translate)('server.email.report.last_sync');
          content += ` ${lastCheckDate})\n`;
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

      if (operationsByAccount.size) {
        content += '\n';
        content += (0, _helpers.translate)('server.email.report.new_operations');
        content += '\n';
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = operationsByAccount.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            let pair = _step6.value;
            // Sort operations by date or import date
            let operations = pair.operations.sort((a, b) => {
              let ad = a.date || a.importDate;
              let bd = b.date || b.importDate;

              if (ad < bd) {
                return -1;
              }

              if (ad === bd) {
                return 0;
              }

              return 1;
            });
            content += `\n${(0, _helpers.displayLabel)(pair.account)}:\n`;
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = operations[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                let op = _step7.value;

                let date = _helpers.formatDate.toShortString(op.date);

                content += `\t* ${date} - ${op.label} : `;
                content += `${pair.account.formatCurrency(op.amount)}\n`;
              }
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
                  _iterator7.return();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      } else {
        content += (0, _helpers.translate)('server.email.report.no_new_operations');
      }

      content += '\n';
      content += (0, _helpers.translate)('server.email.seeyoulater.report');
      content += '\n\n';
      content += (0, _helpers.translate)('server.email.signature');
      let subject;
      subject = (0, _helpers.translate)('server.email.report.subject', {
        frequency
      });
      subject = `Kresus - ${subject}`;
      return {
        subject,
        content
      };
    })();
  }

  computeIncludeAfter(frequency) {
    let includeAfter = (0, _moment.default)();

    switch (frequency) {
      case 'daily':
        includeAfter.subtract(1, 'days');
        break;

      case 'weekly':
        includeAfter.subtract(7, 'days');
        break;

      case 'monthly':
        includeAfter.subtract(1, 'months').days(0);
        break;

      default:
        log.error('unexpected frequency in report-manager');
        break;
    } // The report is sent only for operations imported after
    // POLLER_START_HIGH_HOUR in the morning.


    includeAfter.hours(_helpers.POLLER_START_HIGH_HOUR).minutes(0).seconds(0);
    return includeAfter;
  }

}

var _default = new ReportManager();

exports.default = _default;