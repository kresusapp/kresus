"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const weboob = __importStar(require("../providers/weboob"));
const emailer_1 = __importDefault(require("../lib/emailer"));
const notifications_1 = __importStar(require("../lib/notifications"));
const errors_json_1 = require("../shared/errors.json");
const helpers_1 = require("../helpers");
function postSave(userId, key, value) {
    switch (key) {
        case 'email-recipient':
            emailer_1.default().forceReinit(value);
            break;
        case 'apprise-url':
            notifications_1.default(userId).forceReinit(value);
            break;
        case 'locale':
            helpers_1.setupTranslator(value);
            break;
        default:
            break;
    }
}
async function save(req, res) {
    try {
        let pair = req.body;
        if (typeof pair.key === 'undefined') {
            throw new helpers_1.KError('Missing key when saving a setting', 400);
        }
        if (typeof pair.value === 'undefined') {
            throw new helpers_1.KError('Missing value when saving a setting', 400);
        }
        let { id: userId } = req.user;
        await models_1.Setting.updateByKey(userId, pair.key, pair.value);
        postSave(userId, pair.key, pair.value);
        res.status(200).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when saving a setting');
    }
}
exports.save = save;
async function getWeboobVersion(req, res) {
    try {
        const version = await weboob.getVersion(/* force = */ true);
        if (version === helpers_1.UNKNOWN_WEBOOB_VERSION) {
            throw new helpers_1.KError('cannot get weboob version', 500, errors_json_1.WEBOOB_NOT_INSTALLED);
        }
        res.json({
            data: {
                version,
                isInstalled: helpers_1.checkWeboobMinimalVersion(version)
            }
        });
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when getting weboob version');
    }
}
exports.getWeboobVersion = getWeboobVersion;
async function updateWeboob(req, res) {
    try {
        await weboob.updateWeboobModules();
        res.status(200).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when updating weboob');
    }
}
exports.updateWeboob = updateWeboob;
async function testEmail(req, res) {
    try {
        let { email } = req.body;
        if (!email) {
            throw new helpers_1.KError('Missing email recipient address when sending a test email', 400);
        }
        await emailer_1.default().sendTestEmail(email);
        res.status(200).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when trying to send an email');
    }
}
exports.testEmail = testEmail;
async function testNotification(req, res) {
    try {
        let { appriseUrl } = req.body;
        if (!appriseUrl) {
            throw new helpers_1.KError('Missing apprise url when sending a notification', 400);
        }
        await notifications_1.sendTestNotification(appriseUrl);
        res.status(200).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when trying to send a notification');
    }
}
exports.testNotification = testNotification;
function isDemoForced() {
    return process.kresus.forceDemoMode === true;
}
exports.isDemoForced = isDemoForced;
async function isDemoEnabled(userId) {
    return isDemoForced() || (await models_1.Setting.findOrCreateDefaultBooleanValue(userId, 'demo-mode'));
}
exports.isDemoEnabled = isDemoEnabled;
