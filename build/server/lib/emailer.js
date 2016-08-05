'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _cozydb = require('cozydb');

var _cozydb2 = _interopRequireDefault(_cozydb);

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('emailer');

var Emailer = function () {
    function Emailer() {
        (0, _classCallCheck3.default)(this, Emailer);

        if (process.kresus.standalone) {
            this.internalSendToUser = (0, _helpers.promisify)(function (opts, cb) {
                log.warn('Trying to send email in standalone mode, NYI.');
                log.warn('Email content:\n' + opts.subject + '\n' + opts.content);
                cb(null);
            });
        } else {
            var _context;

            this.internalSendToUser = (0, _helpers.promisify)((_context = _cozydb2.default.api).sendMailToUser.bind(_context));
        }
    }

    // opts = {from, subject, content, html}


    (0, _createClass3.default)(Emailer, [{
        key: 'sendToUser',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(opts) {
                return _regenerator2.default.wrap(function _callee$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                opts.from = opts.from || 'Kresus <kresus-noreply@cozycloud.cc>';

                                if (opts.subject) {
                                    _context2.next = 3;
                                    break;
                                }

                                return _context2.abrupt('return', log.warn('Emailer.send misuse: subject is required'));

                            case 3:
                                if (!(!opts.content && !opts.html)) {
                                    _context2.next = 5;
                                    break;
                                }

                                return _context2.abrupt('return', log.warn('Emailer.send misuse: content/html is required'));

                            case 5:
                                _context2.next = 7;
                                return this.internalSendToUser(opts);

                            case 7:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee, this);
            }));

            function sendToUser(_x) {
                return _ref.apply(this, arguments);
            }

            return sendToUser;
        }()
    }]);
    return Emailer;
}();

exports.default = new Emailer();