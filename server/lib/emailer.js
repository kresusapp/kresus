import cozydb from 'cozydb';
import nodemailer from 'nodemailer';

import {
    makeLogger,
    promisify,
    translate as $t,
} from '../helpers';

import Config from '../models/config';

let log = makeLogger('emailer');

class Emailer
{
    async forceReinit() {
        log.info('Initializing emailer...');

        let mailConfig = JSON.parse((await Config.findOrCreateDefault('mail-config')).value);

        if (process.kresus.standalone) {
            mailConfig.direct = false;
            mailConfig.pool = false;

            this.toEmail = mailConfig.toEmail;
            delete mailConfig.toEmail;

            this.fromEmail = mailConfig.fromEmail || 'Kresus <kresus-noreply@example.tld>';
            delete mailConfig.fromEmail;

            if (mailConfig.auth && mailConfig.auth.user === '' && mailConfig.auth.pass === '') {
                delete mailConfig.auth;
            }

            this.transport = nodemailer.createTransport(mailConfig);
        } else {
            this.fromEmail = mailConfig.fromEmail || 'Kresus <kresus-noreply@cozycloud.cc>';
        }

        log.info('Successfully initialized emailer!');
        this.initialized = true;
    }

    async init() {
        if (this.initialized) {
            return;
        }
        await this.forceReinit();
    }

    constructor() {
        this.initialized = false;
        if (process.kresus.standalone) {
            this.internalSendToUser = promisify((opts, cb) => {
                if (!this.toEmail) {
                    log.warn('No destination email defined, aborting.');
                    cb(null);
                    return;
                }

                let mailOpts = {
                    from: opts.from,
                    to: opts.to || this.toEmail,
                    subject: opts.subject,
                    text: opts.content || '',
                    html: opts.html
                };

                log.info('About to send email. Metadata:',
                         mailOpts.from, mailOpts.to, mailOpts.subject);

                this.transport.sendMail(mailOpts, (err, info) => {
                    if (err) {
                        cb(err);
                        return;
                    }

                    log.info('Message sent: ', info.response);
                    cb(null);
                });

            });
        } else {
            // No need for explicit initialization for the cozy email sender.
            this.initialized = true;
            this.internalSendToUser = promisify(::cozydb.api.sendMailToUser);
        }
    }

    // opts = {from, subject, content, html}
    async sendToUser(opts) {
        await this.init();
        opts.from = opts.from || this.fromEmail;
        if (!opts.subject)
            return log.warn('Emailer.send misuse: subject is required');
        if (!opts.content && !opts.html)
            return log.warn('Emailer.send misuse: content/html is required');
        await this.internalSendToUser(opts);
    }

    async sendTestEmail() {
        await this.sendToUser({
            subject: $t('server.email.test_email.subject'),
            content: $t('server.email.test_email.content')
        });
    }
}

export default new Emailer;
