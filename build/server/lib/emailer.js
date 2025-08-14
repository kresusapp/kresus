"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const helpers_1 = require("../helpers");
const settings_1 = require("../shared/settings");
const models_1 = require("../models");
const translator_1 = require("./translator");
const log = (0, helpers_1.makeLogger)('emailer');
class Emailer {
    forceReinit(recipientEmail) {
        this.toEmail = recipientEmail;
    }
    async ensureInit(userId) {
        if (this.toEmail) {
            return;
        }
        log.info('Reinitializing email recipient...');
        const recipientEmail = (await models_1.Setting.findOrCreateDefault(userId, settings_1.EMAIL_RECIPIENT)).value;
        this.forceReinit(recipientEmail);
        log.info('Done!');
    }
    constructor() {
        this.fromEmail = null;
        this.toEmail = null;
        this.transport = null;
        if (!(0, helpers_1.isEmailEnabled)()) {
            log.warn('Email disabled, SMTP not fully configured, or from email address not defined.');
            return;
        }
        this.fromEmail = process.kresus.emailFrom;
        let nodeMailerConfig = {};
        if (process.kresus.emailTransport === 'smtp') {
            (0, helpers_1.assert)(process.kresus.smtpHost !== null, 'smtp host must be defined');
            (0, helpers_1.assert)(process.kresus.smtpPort !== null, 'smtp port must be defined');
            nodeMailerConfig = {
                host: process.kresus.smtpHost,
                port: process.kresus.smtpPort,
                secure: process.kresus.smtpForceTLS,
                tls: {
                    rejectUnauthorized: process.kresus.smtpRejectUnauthorizedTLS,
                },
            };
            if (process.kresus.smtpUser !== null && process.kresus.smtpPassword !== null) {
                nodeMailerConfig.auth = {
                    user: process.kresus.smtpUser,
                    pass: process.kresus.smtpPassword,
                };
            }
        }
        else if (process.kresus.emailTransport === 'sendmail') {
            nodeMailerConfig = {
                sendmail: true,
            };
            if (process.kresus.emailSendmailBin) {
                nodeMailerConfig.path = process.kresus.emailSendmailBin;
            }
        }
        this.transport = nodemailer_1.default.createTransport(nodeMailerConfig);
    }
    // Internal method.
    _send(opts) {
        if (!(0, helpers_1.isEmailEnabled)()) {
            log.warn('Trying to send an email although emails are not configured, aborting.');
            return;
        }
        return new Promise((accept, reject) => {
            const toEmail = opts.to || this.toEmail;
            if (!toEmail) {
                log.warn('No destination email defined, aborting.');
                return accept(null);
            }
            const mailOpts = {
                from: opts.from,
                to: toEmail,
                subject: opts.subject,
                text: opts.content || '',
                html: opts.html,
            };
            log.info('About to send email. Metadata:', mailOpts.from, mailOpts.to, mailOpts.subject);
            (0, helpers_1.assert)(this.transport !== null, 'transport must have been initialized at this point');
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
    async sendToUser(userId, opts) {
        await this.ensureInit(userId);
        (0, helpers_1.assert)(this.fromEmail !== null, 'fromEmail must have been initialized before sending emails');
        opts.from = opts.from || this.fromEmail;
        if (!opts.subject) {
            return log.warn('Emailer.send misuse: subject is required');
        }
        if (!opts.content && !opts.html) {
            return log.warn('Emailer.send misuse: content/html is required');
        }
        await this._send(opts);
    }
    async sendTestEmail(userId, recipientEmail) {
        const i18n = await (0, translator_1.getTranslator)(userId);
        (0, helpers_1.assert)(this.fromEmail !== null, 'fromEmail must have been initialized before sending emails');
        await this._send({
            from: this.fromEmail,
            to: recipientEmail,
            subject: (0, helpers_1.translate)(i18n, 'server.email.test_email.subject'),
            content: (0, helpers_1.translate)(i18n, 'server.email.test_email.content'),
        });
    }
}
exports.Emailer = Emailer;
let EMAILER = null;
function getEmailer() {
    if (!(0, helpers_1.isEmailEnabled)()) {
        return null;
    }
    if (EMAILER === null) {
        EMAILER = new Emailer();
    }
    return EMAILER;
}
exports.default = getEmailer;
