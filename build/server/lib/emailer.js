'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _helpers = require('../helpers');

var _config = require('../models/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let log = (0, _helpers.makeLogger)('emailer');

class Emailer {
    forceReinit(recipientEmail) {
        this.toEmail = recipientEmail;
    }

    ensureInit() {
        var _this = this;

        return _asyncToGenerator(function* () {
            if (_this.toEmail) {
                return;
            }
            log.info('Reinitializing email recipient...');
            let recipientEmail = (yield _config2.default.findOrCreateDefault('email-recipient')).value;
            _this.forceReinit(recipientEmail);
            log.info('Done!');
        })();
    }

    constructor() {
        if (!(0, _helpers.isEmailEnabled)()) {
            log.warn("One of emailFrom, smtpHost or smtpPort is missing: emails won't work.");
            return;
        }

        this.fromEmail = process.kresus.emailFrom;
        this.toEmail = null;

        let nodeMailerConfig = {};
        if (process.kresus.emailTransport === 'smtp') {
            nodeMailerConfig = {
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
        } else if (process.kresus.emailTransport === 'sendmail') {
            nodeMailerConfig = {
                sendmail: true
            };

            if (process.kresus.emailSendmailBin) {
                nodeMailerConfig.path = process.kresus.emailSendmailBin;
            }
        } else {
            (0, _helpers.assert)(false, 'unreachable because of prior call to isEmailEnabled()');
        }

        this.transport = _nodemailer2.default.createTransport(nodeMailerConfig);
    }

    // Internal method.
    _send(opts) {
        if (!(0, _helpers.isEmailEnabled)()) {
            log.warn('Trying to send an email although emails are not configured, aborting.');
            return;
        }

        return new Promise((accept, reject) => {
            let toEmail = opts.to || this.toEmail;
            if (!toEmail) {
                log.warn('No destination email defined, aborting.');
                return accept(null);
            }

            let mailOpts = {
                from: opts.from,
                to: toEmail,
                subject: opts.subject,
                text: opts.content || '',
                html: opts.html
            };

            log.info('About to send email. Metadata:', mailOpts.from, mailOpts.to, mailOpts.subject);

            this.transport.sendMail(mailOpts, (err, info) => {
                if (err) {
                    log.error(err);
                    reject(err);
                    return;
                }
                log.info('Message sent: ', info.response);
                accept(null);
            });
        });
    }

    // opts = {from, subject, content, html}
    sendToUser(opts) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            yield _this2.ensureInit();
            opts.from = opts.from || _this2.fromEmail;
            if (!opts.subject) {
                return log.warn('Emailer.send misuse: subject is required');
            }
            if (!opts.content && !opts.html) {
                return log.warn('Emailer.send misuse: content/html is required');
            }
            yield _this2._send(opts);
        })();
    }

    sendTestEmail(recipientEmail) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            yield _this3._send({
                from: _this3.fromEmail,
                to: recipientEmail,
                subject: (0, _helpers.translate)('server.email.test_email.subject'),
                content: (0, _helpers.translate)('server.email.test_email.content')
            });
        })();
    }
}

exports.default = new Emailer();