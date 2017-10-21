'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cozydb = require('cozydb');

var _cozydb2 = _interopRequireDefault(_cozydb);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _helpers = require('../helpers');

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _helpers.makeLogger)('emailer');

var Emailer = function () {
    _createClass(Emailer, [{
        key: 'forceReinit',
        value: function forceReinit(recipientEmail) {
            (0, _helpers.assert)(process.kresus.standalone);
            this.toEmail = recipientEmail;
        }
    }, {
        key: 'ensureInit',
        value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                var recipientEmail;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!this.toEmail) {
                                    _context.next = 2;
                                    break;
                                }

                                return _context.abrupt('return');

                            case 2:
                                log.info('Reinitializing email recipient...');
                                _context.next = 5;
                                return _config2.default.findOrCreateDefault('email-recipient');

                            case 5:
                                recipientEmail = _context.sent.value;

                                this.forceReinit(recipientEmail);
                                log.info('Done!');

                            case 8:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function ensureInit() {
                return _ref.apply(this, arguments);
            }

            return ensureInit;
        }()
    }, {
        key: '_initStandalone',
        value: function _initStandalone() {
            var _this = this;

            if (!(0, _helpers.isEmailEnabled)()) {
                log.warn("One of emailFrom, smtpHost or smtpPort is missing: emails won't work.");
                this.internalSendToUser = function () {
                    log.warn('Trying to send an email although emails are not configured, aborting.');
                };
                return;
            }

            var nodeMailerConfig = {
                host: process.kresus.smtpHost,
                port: process.kresus.smtpPort,
                direct: false,
                pool: false,
                secure: process.kresus.smtpForceTLS,
                tls: {
                    rejectUnauthorized: process.kresus.smtpRejectUnauthorizedTLS
                }
            };

            if (process.kresus.smtpUser || process.kresus.smtpPassword) {
                nodeMailerConfig.auth = {
                    user: process.kresus.smtpUser,
                    pass: process.kresus.smtpPassword
                };
            }

            this.transport = _nodemailer2.default.createTransport(nodeMailerConfig);

            this.internalSendToUser = function (opts) {
                return new Promise(function (accept, reject) {
                    var toEmail = opts.to || _this.toEmail;
                    if (!toEmail) {
                        log.warn('No destination email defined, aborting.');
                        return accept(null);
                    }

                    var mailOpts = {
                        from: opts.from,
                        to: toEmail,
                        subject: opts.subject,
                        text: opts.content || '',
                        html: opts.html
                    };

                    log.info('About to send email. Metadata:', mailOpts.from, mailOpts.to, mailOpts.subject);

                    _this.transport.sendMail(mailOpts, function (err, info) {
                        if (err) {
                            log.error(err);
                            reject(err);
                            return;
                        }
                        log.info('Message sent: ', info.response);
                        accept(null);
                    });
                });
            };
        }
    }]);

    function Emailer() {
        _classCallCheck(this, Emailer);

        this.fromEmail = process.kresus.emailFrom;
        this.toEmail = null;
        if (process.kresus.standalone) {
            this._initStandalone();
        } else {
            var _context2;

            // No need for explicit initialization for the cozy email sender.
            this.toEmail = true;
            this.fromEmail = this.fromEmail || 'Kresus <kresus-noreply@cozycloud.cc>';
            this.internalSendToUser = (0, _helpers.promisify)((_context2 = _cozydb2.default.api).sendMailToUser.bind(_context2));
        }
    }

    // opts = {from, subject, content, html}


    _createClass(Emailer, [{
        key: 'sendToUser',
        value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(opts) {
                return regeneratorRuntime.wrap(function _callee2$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.ensureInit();

                            case 2:
                                opts.from = opts.from || this.fromEmail;

                                if (opts.subject) {
                                    _context3.next = 5;
                                    break;
                                }

                                return _context3.abrupt('return', log.warn('Emailer.send misuse: subject is required'));

                            case 5:
                                if (!(!opts.content && !opts.html)) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', log.warn('Emailer.send misuse: content/html is required'));

                            case 7:
                                _context3.next = 9;
                                return this.internalSendToUser(opts);

                            case 9:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function sendToUser(_x) {
                return _ref2.apply(this, arguments);
            }

            return sendToUser;
        }()
    }, {
        key: 'sendTestEmail',
        value: function () {
            var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(recipientEmail) {
                return regeneratorRuntime.wrap(function _callee3$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.internalSendToUser({
                                    from: this.fromEmail,
                                    to: recipientEmail,
                                    subject: (0, _helpers.translate)('server.email.test_email.subject'),
                                    content: (0, _helpers.translate)('server.email.test_email.content')
                                });

                            case 2:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function sendTestEmail(_x2) {
                return _ref3.apply(this, arguments);
            }

            return sendTestEmail;
        }()
    }]);

    return Emailer;
}();

exports.default = new Emailer();