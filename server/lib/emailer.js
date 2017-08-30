import cozydb from 'cozydb';
import nodemailer from 'nodemailer';

import {
    assert,
    makeLogger,
    promisify,
    translate as $t
} from '../helpers';

import Config from '../models/config';

let log = makeLogger('emailer');

class Emailer {
    forceReinit(recipientEmail) {
        assert(process.kresus.standalone);
        this.toEmail = recipientEmail;
    }

    async ensureInit() {
        if (this.toEmail) {
            return;
        }
        log.info('Reinitializing email recipient...');
        let recipientEmail = (await Config.findOrCreateDefault('email-recipient')).value;
        this.forceReinit(recipientEmail);
        log.info('Done!');
    }

    _initStandalone() {
        if (!process.kresus.emailFrom.length ||
            !process.kresus.smtpHost ||
            !process.kresus.smtpPort) {
            this.internalSendToUser = () => {
                log.warn('Trying to send an email although emails are not configured, aborting.');
            };
            return;
        }

        let nodeMailerConfig = {
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

        this.transport = nodemailer.createTransport(nodeMailerConfig);

        this.internalSendToUser = opts => {
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

                log.info('About to send email. Metadata:',
                         mailOpts.from, mailOpts.to, mailOpts.subject);

                this.transport.sendMail(mailOpts, (err, info) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    log.info('Message sent: ', info.response);
                    accept(null);
                });
            });
        };
    }

    constructor() {
        this.fromEmail = process.kresus.emailFrom;
        this.toEmail = null;
        if (process.kresus.standalone) {
            this._initStandalone();
        } else {
            // No need for explicit initialization for the cozy email sender.
            this.toEmail = true;
            this.fromEmail = this.fromEmail || 'Kresus <kresus-noreply@cozycloud.cc>';
            this.internalSendToUser = promisify(::cozydb.api.sendMailToUser);
        }
    }

    // opts = {from, subject, content, html}
    async sendToUser(opts) {
        await this.ensureInit();
        opts.from = opts.from || this.fromEmail;
        if (!opts.subject)
            return log.warn('Emailer.send misuse: subject is required');
        if (!opts.content && !opts.html)
            return log.warn('Emailer.send misuse: content/html is required');
        await this.internalSendToUser(opts);
    }

    async sendTestEmail(recipientEmail) {
        await this.internalSendToUser({
            from: this.fromEmail,
            to: recipientEmail,
            subject: $t('server.email.test_email.subject'),
            content: $t('server.email.test_email.content')
        });
    }
}

export default new Emailer;
