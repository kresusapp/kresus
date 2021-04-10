import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import SendMail from 'nodemailer/lib/sendmail-transport';
import Mail from 'nodemailer/lib/mailer';

import { assert, makeLogger, translate as $t, isEmailEnabled } from '../helpers';
import { EMAIL_RECIPIENT } from '../shared/settings';

import { Setting } from '../models';

const log = makeLogger('emailer');

interface SendOptions {
    from?: string;
    to?: string;
    subject: string;
    content: string;
    html?: string;
}

export class Emailer {
    fromEmail: string | null = null;
    toEmail: string | null = null;
    transport: Mail | null = null;

    forceReinit(recipientEmail: string) {
        this.toEmail = recipientEmail;
    }

    async ensureInit(userId: number) {
        if (this.toEmail) {
            return;
        }
        log.info('Reinitializing email recipient...');
        const recipientEmail = (await Setting.findOrCreateDefault(userId, EMAIL_RECIPIENT)).value;
        this.forceReinit(recipientEmail);
        log.info('Done!');
    }

    constructor() {
        if (!isEmailEnabled()) {
            log.warn(
                'Email disabled, SMTP not fully configured, or from email address not defined.'
            );
            return;
        }

        this.fromEmail = process.kresus.emailFrom;

        let nodeMailerConfig: SMTPTransport.Options | SendMail.Options = {};
        if (process.kresus.emailTransport === 'smtp') {
            assert(process.kresus.smtpHost !== null, 'smtp host must be defined');
            assert(process.kresus.smtpPort !== null, 'smtp port must be defined');

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
        } else if (process.kresus.emailTransport === 'sendmail') {
            nodeMailerConfig = {
                sendmail: true,
            };

            if (process.kresus.emailSendmailBin) {
                nodeMailerConfig.path = process.kresus.emailSendmailBin;
            }
        }

        this.transport = nodemailer.createTransport(nodeMailerConfig);
    }

    // Internal method.
    private _send(opts: SendOptions) {
        if (!isEmailEnabled()) {
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

            log.info(
                'About to send email. Metadata:',
                mailOpts.from,
                mailOpts.to,
                mailOpts.subject
            );

            assert(this.transport !== null, 'transport must have been initialized at this point');
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

    async sendToUser(userId: number, opts: SendOptions) {
        await this.ensureInit(userId);
        assert(
            this.fromEmail !== null,
            'fromEmail must have been initialized before sending emails'
        );
        opts.from = opts.from || this.fromEmail;
        if (!opts.subject) {
            return log.warn('Emailer.send misuse: subject is required');
        }
        if (!opts.content && !opts.html) {
            return log.warn('Emailer.send misuse: content/html is required');
        }
        await this._send(opts);
    }

    async sendTestEmail(recipientEmail: string) {
        assert(
            this.fromEmail !== null,
            'fromEmail must have been initialized before sending emails'
        );
        await this._send({
            from: this.fromEmail,
            to: recipientEmail,
            subject: $t('server.email.test_email.subject'),
            content: $t('server.email.test_email.content'),
        });
    }
}

let EMAILER: Emailer | null = null;
function getEmailer(): Emailer | null {
    if (!isEmailEnabled()) {
        return null;
    }
    if (EMAILER === null) {
        EMAILER = new Emailer();
    }
    return EMAILER;
}

export default getEmailer;
