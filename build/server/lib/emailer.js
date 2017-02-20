'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _helpers = require('../helpers');

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('emailer');

var Emailer = function () {
    (0, _createClass3.default)(Emailer, [{
        key: 'createTransport',
        value: function createTransport(config) {
            config.direct = false;
            config.pool = false;

            if (config.auth && config.auth.user === '' && config.auth.pass === '') {
                delete config.auth;
            }

            return _nodemailer2.default.createTransport(config);
        }
    }, {
        key: 'forceReinit',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var config;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                log.info('Initializing emailer...');

                                _context.t0 = JSON;
                                _context.next = 4;
                                return _config2.default.findOrCreateDefault('mail-config');

                            case 4:
                                _context.t1 = _context.sent.value;
                                config = _context.t0.parse.call(_context.t0, _context.t1);


                                if (process.kresus.standalone) {
                                    this.toEmail = config.toEmail;
                                    delete config.toEmail;

                                    this.fromEmail = config.fromEmail || 'Kresus <kresus-noreply@example.tld>';
                                    delete config.fromEmail;

                                    this.transport = this.createTransport(config);
                                } else {
                                    this.fromEmail = config.fromEmail || 'Kresus <kresus-noreply@cozycloud.cc>';
                                }

                                log.info('Successfully initialized emailer!');
                                this.initialized = true;

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function forceReinit() {
                return _ref.apply(this, arguments);
            }

            return forceReinit;
        }()
    }, {
        key: 'init',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this.initialized) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 2:
                                _context2.next = 4;
                                return this.forceReinit();

                            case 4:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function init() {
                return _ref2.apply(this, arguments);
            }

            return init;
        }()
    }]);

    function Emailer() {
        var _this = this;

        (0, _classCallCheck3.default)(this, Emailer);

        this.initialized = false;
        if (process.kresus.standalone) {
            this.internalSendToUser = function (opts) {
                var providedTransport = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

                var transport = providedTransport || _this.transport;

                return new _promise2.default(function (accept, reject) {
                    if (!opts.to && !_this.toEmail) {
                        log.warn('No destination email defined, aborting.');
                        return reject(new Error('no email'));
                    }

                    var mailOpts = {
                        from: opts.from,
                        to: opts.to || _this.toEmail,
                        subject: opts.subject,
                        text: opts.content || '',
                        html: opts.html
                    };

                    log.info('About to send email. Metadata:', mailOpts.from, mailOpts.to, mailOpts.subject);

                    transport.sendMail(mailOpts, function (err, info) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        log.info('Message sent: ', info.response);
                        accept(null);
                    });
                });
            };
        } else {
            var _context3;

            // No need for explicit initialization for the cozy email sender.
            this.initialized = true;
            this.internalSendToUser = (0, _helpers.promisify)((_context3 = _cozydb2.default.api).sendMailToUser.bind(_context3));
        }
    }

    // opts = {from, subject, content, html}


    (0, _createClass3.default)(Emailer, [{
        key: 'sendToUser',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(opts) {
                return _regenerator2.default.wrap(function _callee3$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.init();

                            case 2:
                                opts.from = opts.from || this.fromEmail;

                                if (opts.subject) {
                                    _context4.next = 5;
                                    break;
                                }

                                return _context4.abrupt('return', log.warn('Emailer.send misuse: subject is required'));

                            case 5:
                                if (!(!opts.content && !opts.html)) {
                                    _context4.next = 7;
                                    break;
                                }

                                return _context4.abrupt('return', log.warn('Emailer.send misuse: content/html is required'));

                            case 7:
                                _context4.next = 9;
                                return this.internalSendToUser(opts);

                            case 9:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function sendToUser(_x2) {
                return _ref3.apply(this, arguments);
            }

            return sendToUser;
        }()
    }, {
        key: 'sendTestEmail',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(config) {
                var transport;
                return _regenerator2.default.wrap(function _callee4$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                transport = this.createTransport(config);
                                _context5.next = 3;
                                return this.internalSendToUser({
                                    from: config.fromEmail,
                                    to: config.toEmail,
                                    subject: (0, _helpers.translate)('server.email.test_email.subject'),
                                    content: (0, _helpers.translate)('server.email.test_email.content')
                                }, transport);

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function sendTestEmail(_x3) {
                return _ref4.apply(this, arguments);
            }

            return sendTestEmail;
        }()
    }]);
    return Emailer;
}();

exports.default = new Emailer();