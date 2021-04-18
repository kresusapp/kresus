"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestNotification = void 0;
const url_1 = require("url");
const helpers_1 = require("../helpers");
const settings_1 = require("../shared/settings");
const settings_2 = __importDefault(require("../models/entities/settings"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const log = helpers_1.makeLogger('notifications');
class Notifier {
    constructor() {
        this.appriseApiBaseUrl =
            process.kresus.appriseApiBaseUrl !== null
                ? url_1.resolve(process.kresus.appriseApiBaseUrl, '/notify')
                : null;
    }
    _send(opts) {
        if (process.env.NODE_ENV !== 'production') {
            log.warn(`Notification: Subject: ${opts.subject}; Content: ${opts.content}`);
        }
        if (!helpers_1.isAppriseApiEnabled()) {
            log.warn("AppriseApiBaseUrl is missing: notifications won't work.");
            return;
        }
        helpers_1.assert(this.appriseApiBaseUrl !== null, 'enabled means apprise base url is set');
        const body = {
            urls: opts.appriseUrl,
            title: opts.subject,
            body: opts.content,
        };
        return node_fetch_1.default(this.appriseApiBaseUrl, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }).then(res => {
            if (!res.ok) {
                throw new helpers_1.KError("Couldn't send notification with apprise", res.status, res.statusText);
            }
        });
    }
    async sendTestNotification(appriseUrl) {
        await this._send({
            appriseUrl,
            subject: helpers_1.translate('server.notification.test_notification.subject'),
            content: helpers_1.translate('server.notification.test_notification.content'),
        });
    }
}
let NOTIFIER = null;
function _getBaseNotifier() {
    if (!helpers_1.isAppriseApiEnabled()) {
        return null;
    }
    if (NOTIFIER === null) {
        NOTIFIER = new Notifier();
    }
    return NOTIFIER;
}
class UserNotifier {
    constructor(userId) {
        this.userId = userId;
        this.appriseUserUrl = null;
    }
    forceReinit(appriseUserUrl) {
        this.appriseUserUrl = appriseUserUrl;
    }
    async ensureInit() {
        if (this.appriseUserUrl) {
            return;
        }
        this.forceReinit((await settings_2.default.findOrCreateDefault(this.userId, settings_1.APPRISE_URL)).value);
        log.info(`Apprise url fetched for user ${this.userId}`);
    }
    async send(subject, content) {
        await this.ensureInit();
        helpers_1.assert(this.appriseUserUrl !== null, 'appriseUserUrl should have been set by ensureInit');
        if (!subject) {
            return log.warn('Notifier.send misuse: subject is required');
        }
        if (!content) {
            return log.warn('Notifier.send misuse: content is required');
        }
        const notifier = _getBaseNotifier();
        helpers_1.assert(notifier !== null, 'Notifier.send misuse: no notifier available');
        await notifier._send({ subject, content, appriseUrl: this.appriseUserUrl });
    }
}
const NOTIFIER_PER_USER_ID = {};
function getNotifier(userId) {
    if (!helpers_1.isAppriseApiEnabled()) {
        return null;
    }
    if (!(userId in NOTIFIER_PER_USER_ID)) {
        log.info(`Notifier initialized for user ${userId}`);
        NOTIFIER_PER_USER_ID[userId] = new UserNotifier(userId);
    }
    return NOTIFIER_PER_USER_ID[userId];
}
async function sendTestNotification(appriseUrl) {
    const notifier = _getBaseNotifier();
    if (notifier) {
        await notifier.sendTestNotification(appriseUrl);
    }
}
exports.sendTestNotification = sendTestNotification;
exports.default = getNotifier;
