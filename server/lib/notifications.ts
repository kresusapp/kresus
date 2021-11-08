import * as https from 'https';
import * as http from 'http';
import { TextEncoder } from 'util';
import { resolve } from 'url';

import { assert, makeLogger, translate as $t, KError, isAppriseApiEnabled } from '../helpers';
import { APPRISE_URL } from '../shared/settings';

import Settings from '../models/entities/settings';

import { getTranslator } from './translator';

const log = makeLogger('notifications');

interface SendOptions {
    appriseUrl: string;
    subject: string;
    content: string;
}

function jsonRequest(url: string, method: 'GET' | 'POST', jsonData: Record<string, any>) {
    const data = new TextEncoder().encode(JSON.stringify(jsonData));

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
        },
    };

    const protocol = url.startsWith('https') ? https : http;

    return new Promise((ok, reject) => {
        let response = '';
        let status: undefined | number, statusText: undefined | string;

        const req = protocol.request(url, options, res => {
            if (typeof res.statusCode !== 'undefined') {
                status = res.statusCode;
                statusText = res.statusMessage;
                const statusFamily = (status / 100) | 0;
                if (statusFamily === 4 || statusFamily === 5) {
                    // 400 or 500 family means error.
                    return reject(
                        new Error(`Http request failed with status ${status}: ${statusText}`)
                    );
                }
            }
            res.setEncoding('utf-8');
            res.on('data', d => {
                response += d;
            });
            res.on('end', () => {
                ok(response);
            });
        });

        req.on('error', error => {
            log.error('http failure:', error.message);
            reject(error);
        });

        req.end(data);
    });
}

class Notifier {
    appriseApiBaseUrl: string | null;

    constructor() {
        this.appriseApiBaseUrl =
            process.kresus.appriseApiBaseUrl !== null
                ? resolve(process.kresus.appriseApiBaseUrl, '/notify')
                : null;
    }

    _send(opts: SendOptions) {
        if (process.env.NODE_ENV !== 'production') {
            log.warn(`Notification: Subject: ${opts.subject}; Content: ${opts.content}`);
        }

        if (!isAppriseApiEnabled()) {
            log.warn("AppriseApiBaseUrl is missing: notifications won't work.");
            return;
        }
        assert(this.appriseApiBaseUrl !== null, 'enabled means apprise base url is set');

        const body = {
            urls: opts.appriseUrl,
            title: opts.subject,
            body: opts.content,
        };

        return jsonRequest(this.appriseApiBaseUrl, 'POST', body).catch(err => {
            log.error('Apprise HTTP error: ', err.message);
            throw new KError("Couldn't send notification with apprise");
        });
    }

    async sendTestNotification(userId: number, appriseUrl: string): Promise<void> {
        const i18n = await getTranslator(userId);
        await this._send({
            appriseUrl,
            subject: $t(i18n, 'server.notification.test_notification.subject'),
            content: $t(i18n, 'server.notification.test_notification.content'),
        });
    }
}

let NOTIFIER: Notifier | null = null;
function _getBaseNotifier(): Notifier | null {
    if (!isAppriseApiEnabled()) {
        return null;
    }
    if (NOTIFIER === null) {
        NOTIFIER = new Notifier();
    }
    return NOTIFIER;
}

class UserNotifier {
    appriseUserUrl: string | null;
    userId: number;

    constructor(userId: number) {
        this.userId = userId;
        this.appriseUserUrl = null;
    }

    forceReinit(appriseUserUrl: string) {
        this.appriseUserUrl = appriseUserUrl;
    }

    async ensureInit() {
        if (this.appriseUserUrl) {
            return;
        }
        this.forceReinit((await Settings.findOrCreateDefault(this.userId, APPRISE_URL)).value);
        log.info(`Apprise url fetched for user ${this.userId}`);
    }

    async send(subject: string, content: string) {
        await this.ensureInit();
        assert(this.appriseUserUrl !== null, 'appriseUserUrl should have been set by ensureInit');

        if (!subject) {
            return log.warn('Notifier.send misuse: subject is required');
        }
        if (!content) {
            return log.warn('Notifier.send misuse: content is required');
        }

        const notifier = _getBaseNotifier();
        assert(notifier !== null, 'Notifier.send misuse: no notifier available');
        await notifier._send({ subject, content, appriseUrl: this.appriseUserUrl });
    }
}

const NOTIFIER_PER_USER_ID: { [k: string]: UserNotifier } = {};
function getNotifier(userId: number): UserNotifier | null {
    if (!isAppriseApiEnabled()) {
        return null;
    }
    if (!(userId in NOTIFIER_PER_USER_ID)) {
        log.info(`Notifier initialized for user ${userId}`);
        NOTIFIER_PER_USER_ID[userId] = new UserNotifier(userId);
    }
    return NOTIFIER_PER_USER_ID[userId];
}

export async function sendTestNotification(userId: number, appriseUrl: string): Promise<void> {
    const notifier = _getBaseNotifier();
    if (notifier) {
        await notifier.sendTestNotification(userId, appriseUrl);
    }
}

export default getNotifier;
