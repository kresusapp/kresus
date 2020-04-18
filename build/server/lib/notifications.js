"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const helpers_1 = require("../helpers");
const settings_1 = __importDefault(require("../models/entities/settings"));
const node_fetch_1 = __importDefault(require("node-fetch"));
let log = helpers_1.makeLogger('notifications');
class Notifier {
    constructor() {
        this.enabled = helpers_1.isAppriseApiEnabled();
        this.appriseApiBaseUrl =
            process.kresus.appriseApiBaseUrl !== null
                ? url_1.resolve(process.kresus.appriseApiBaseUrl, '/notify')
                : null;
    }
    /**
     * @param opts {{appriseUrl: string, subject: string, content: string}}
     */
    _send(opts) {
        if (process.env.NODE_ENV !== 'production') {
            log.warn(`Notification: Subject: ${opts.subject}; Content: ${opts.content}`);
        }
        if (!this.enabled) {
            log.warn("AppriseApiBaseUrl is missing: notifications won't work.");
            return;
        }
        const body = {
            urls: opts.appriseUrl,
            title: opts.subject,
            body: opts.content
        };
        return node_fetch_1.default(this.appriseApiBaseUrl, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
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
            content: helpers_1.translate('server.notification.test_notification.content')
        });
    }
}
let NOTIFIER = null;
function _getBaseNotifier() {
    if (NOTIFIER === null) {
        NOTIFIER = new Notifier();
    }
    return NOTIFIER;
}
class UserNotifier {
    constructor(userId) {
        this.userId = userId;
    }
    forceReinit(appriseUserUrl) {
        this.appriseUserUrl = appriseUserUrl;
    }
    async ensureInit() {
        if (this.appriseUserUrl) {
            return;
        }
        this.forceReinit((await settings_1.default.findOrCreateDefault(this.userId, 'apprise-url')).value);
        log.info(`Apprise url fetched for user ${this.userId}`);
    }
    async send(subject, content) {
        await this.ensureInit();
        if (!subject) {
            return log.warn('Notifier.send misuse: subject is required');
        }
        if (!content) {
            return log.warn('Notifier.send misuse: content is required');
        }
        await _getBaseNotifier()._send({ subject, content, appriseUrl: this.appriseUserUrl });
    }
}
let NOTIFIER_PER_USER_ID = {};
function getNotifier(userId) {
    if (!(userId in NOTIFIER_PER_USER_ID)) {
        log.info(`Notifier initialized for user ${userId}`);
        NOTIFIER_PER_USER_ID[userId] = new UserNotifier(userId);
    }
    return NOTIFIER_PER_USER_ID[userId];
}
function sendTestNotification(appriseUrl) {
    return _getBaseNotifier().sendTestNotification(appriseUrl);
}
exports.sendTestNotification = sendTestNotification;
exports.default = getNotifier;
