"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const helpers_1 = require("../helpers");
const models_1 = require("../models");
let log = helpers_1.makeLogger('emailer');
class Emailer {
    forceReinit(recipientEmail) {
        this.toEmail = recipientEmail;
    }
    async ensureInit(userId) {
        if (this.toEmail) {
            return;
        }
        log.info('Reinitializing email recipient...');
        let recipientEmail = (await models_1.Setting.findOrCreateDefault(userId, 'email-recipient')).value;
        this.forceReinit(recipientEmail);
        log.info('Done!');
    }
    constructor() {
        if (!helpers_1.isEmailEnabled()) {
            log.warn("One of emailFrom, smtpHost or smtpPort is missing: emails won't work.");
            return;
        }
        helpers_1.assert(process.kresus.smtpHost !== null, 'smtp host must be defined');
        helpers_1.assert(process.kresus.smtpPort !== null, 'smtp port must be defined');
        this.fromEmail = process.kresus.emailFrom;
        this.toEmail = null;
        /** @type {SMTPTransport.Options | SendMail.Options} */
        let nodeMailerConfig = {};
        if (process.kresus.emailTransport === 'smtp') {
            nodeMailerConfig = {
                host: process.kresus.smtpHost,
                port: process.kresus.smtpPort,
                secure: process.kresus.smtpForceTLS,
                tls: {
                    rejectUnauthorized: process.kresus.smtpRejectUnauthorizedTLS
                }
            };
            if (process.kresus.smtpUser !== null && process.kresus.smtpPassword !== null) {
                nodeMailerConfig.auth = {
                    user: process.kresus.smtpUser,
                    pass: process.kresus.smtpPassword
                };
            }
        }
        else if (process.kresus.emailTransport === 'sendmail') {
            nodeMailerConfig = {
                sendmail: true
            };
            if (process.kresus.emailSendmailBin) {
                nodeMailerConfig.path = process.kresus.emailSendmailBin;
            }
        }
        else {
            helpers_1.assert(false, 'unreachable because of prior call to isEmailEnabled()');
        }
        this.transport = nodemailer_1.default.createTransport(nodeMailerConfig);
    }
    // Internal method.
    _send(opts) {
        if (!helpers_1.isEmailEnabled()) {
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
    async sendToUser(userId, opts) {
        await this.ensureInit(userId);
        opts.from = opts.from || this.fromEmail;
        if (!opts.subject) {
            return log.warn('Emailer.send misuse: subject is required');
        }
        if (!opts.content && !opts.html) {
            return log.warn('Emailer.send misuse: content/html is required');
        }
        await this._send(opts);
    }
    async sendTestEmail(recipientEmail) {
        await this._send({
            from: this.fromEmail,
            to: recipientEmail,
            subject: helpers_1.translate('server.email.test_email.subject'),
            content: helpers_1.translate('server.email.test_email.content')
        });
    }
}
let EMAILER = null;
function getEmailer() {
    if (EMAILER === null) {
        EMAILER = new Emailer();
    }
    return EMAILER;
}
exports.default = getEmailer;
