import nodemailer from 'nodemailer';

import { assert, makeLogger, translate as $t, isEmailEnabled } from '../helpers';

import Settings from '../models/settings';

let log = makeLogger('emailer');

class Emailer {
    forceReinit(recipientEmail) {
        this.toEmail = recipientEmail;
    }

    async ensureInit(userId) {
        if (this.toEmail) {
            return;
        }
        log.info('Reinitializing email recipient...');
        let recipientEmail = (await Settings.findOrCreateDefault(userId, 'email-recipient')).value;
        this.forceReinit(recipientEmail);
        log.info('Done!');
    }

    constructor() {
        if (!isEmailEnabled()) {
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
            assert(false, 'unreachable because of prior call to isEmailEnabled()');
        }

        this.transport = nodemailer.createTransport(nodeMailerConfig);
    }

    // Internal method.
    _send(opts) {
        if (!isEmailEnabled()) {
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

            log.info(
                'About to send email. Metadata:',
                mailOpts.from,
                mailOpts.to,
                mailOpts.subject
            );

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
            subject: $t('server.email.test_email.subject'),
            content: $t('server.email.test_email.content')
        });
    }
}

export default new Emailer();
