import cozydb from 'cozydb';
import nodemailer from 'nodemailer';

import {
    makeLogger,
    promisify,
    translate as $t
} from '../helpers';

import Config from '../models/config';

let log = makeLogger('emailer');

class Emailer
{
    createTransport(config) {
        config.direct = false;
        config.pool = false;

        if (config.auth && config.auth.user === '' && config.auth.pass === '') {
            delete config.auth;
        }

        return nodemailer.createTransport(config);
    }

    async forceReinit() {
        log.info('Initializing emailer...');

        let config = JSON.parse((await Config.findOrCreateDefault('mail-config')).value);

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
            this.internalSendToUser = (opts, providedTransport = null) => {
                let transport = providedTransport || this.transport;

                return new Promise((accept, reject) => {
                    if (!opts.to && !this.toEmail) {
                        log.warn('No destination email defined, aborting.');
                        return reject(new Error('no email'));
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

                    transport.sendMail(mailOpts, (err, info) => {
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

    async sendTestEmail(config) {
        let transport = this.createTransport(config);
        await this.internalSendToUser({
            from: config.fromEmail,
            to: config.toEmail,
            subject: $t('server.email.test_email.subject'),
            content: $t('server.email.test_email.content')
        }, transport);
    }
}

export default new Emailer;
