"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestNotification = void 0;
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const util_1 = require("util");
const url_1 = require("url");
const helpers_1 = require("../helpers");
const settings_1 = require("../shared/settings");
const settings_2 = __importDefault(require("../models/entities/settings"));
const translator_1 = require("./translator");
const log = (0, helpers_1.makeLogger)('notifications');
function jsonRequest(url, method, jsonData) {
    const data = JSON.stringify(jsonData);
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': new util_1.TextEncoder().encode(data).length,
        },
    };
    const protocol = url.startsWith('https') ? https : http;
    return new Promise((ok, reject) => {
        let response = '';
        let status, statusText;
        const req = protocol.request(url, options, res => {
            if (typeof res.statusCode !== 'undefined') {
                status = res.statusCode;
                statusText = res.statusMessage;
                const statusFamily = (status / 100) | 0;
                if (statusFamily === 4 || statusFamily === 5) {
                    // 400 or 500 family means error.
                    return reject(new Error(`Http request failed with status ${status}: ${statusText}`));
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
    constructor() {
        this.appriseApiBaseUrl =
            process.kresus.appriseApiBaseUrl !== null
                ? (0, url_1.resolve)(process.kresus.appriseApiBaseUrl, '/notify')
                : null;
    }
    _send(opts) {
        if (process.env.NODE_ENV !== 'production') {
            log.warn(`Notification: Subject: ${opts.subject}; Content: ${opts.content}`);
        }
        if (!(0, helpers_1.isAppriseApiEnabled)()) {
            log.warn("AppriseApiBaseUrl is missing: notifications won't work.");
            return;
        }
        (0, helpers_1.assert)(this.appriseApiBaseUrl !== null, 'enabled means apprise base url is set');
        const body = {
            urls: opts.appriseUrl,
            title: opts.subject,
            body: opts.content,
        };
        return jsonRequest(this.appriseApiBaseUrl, 'POST', body).catch(err => {
            log.error('Apprise HTTP error: ', err.message);
            throw new helpers_1.KError("Couldn't send notification with apprise");
        });
    }
    async sendTestNotification(userId, appriseUrl) {
        const i18n = await (0, translator_1.getTranslator)(userId);
        await this._send({
            appriseUrl,
            subject: (0, helpers_1.translate)(i18n, 'server.notification.test_notification.subject'),
            content: (0, helpers_1.translate)(i18n, 'server.notification.test_notification.content'),
        });
    }
}
let NOTIFIER = null;
function _getBaseNotifier() {
    if (!(0, helpers_1.isAppriseApiEnabled)()) {
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
        (0, helpers_1.assert)(this.appriseUserUrl !== null, 'appriseUserUrl should have been set by ensureInit');
        if (!subject) {
            return log.warn('Notifier.send misuse: subject is required');
        }
        if (!content) {
            return log.warn('Notifier.send misuse: content is required');
        }
        const notifier = _getBaseNotifier();
        (0, helpers_1.assert)(notifier !== null, 'Notifier.send misuse: no notifier available');
        await notifier._send({ subject, content, appriseUrl: this.appriseUserUrl });
    }
}
const NOTIFIER_PER_USER_ID = {};
function getNotifier(userId) {
    if (!(0, helpers_1.isAppriseApiEnabled)()) {
        return null;
    }
    if (!(userId in NOTIFIER_PER_USER_ID)) {
        log.info(`Notifier initialized for user ${userId}`);
        NOTIFIER_PER_USER_ID[userId] = new UserNotifier(userId);
    }
    return NOTIFIER_PER_USER_ID[userId];
}
async function sendTestNotification(userId, appriseUrl) {
    const notifier = _getBaseNotifier();
    if (notifier) {
        await notifier.sendTestNotification(userId, appriseUrl);
    }
}
exports.sendTestNotification = sendTestNotification;
exports.default = getNotifier;
