"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const models_1 = require("../models");
const emailer_1 = __importDefault(require("../lib/emailer"));
const notifications_1 = __importDefault(require("../lib/notifications"));
const helpers_1 = require("../helpers");
const settings_1 = require("../shared/settings");
function postSave(userId, key, value) {
    switch (key) {
        case settings_1.EMAIL_RECIPIENT: {
            const emailSender = emailer_1.default();
            if (emailSender !== null) {
                emailSender.forceReinit(value);
            }
            break;
        }
        case settings_1.APPRISE_URL: {
            const notifier = notifications_1.default(userId);
            if (notifier !== null) {
                notifier.forceReinit(value);
            }
            break;
        }
        case settings_1.LOCALE:
            helpers_1.setupTranslator(value);
            break;
        default:
            break;
    }
}
async function save(req, res) {
    try {
        const pair = req.body;
        if (typeof pair.key === 'undefined') {
            throw new helpers_1.KError('Missing key when saving a setting', 400);
        }
        if (typeof pair.value === 'undefined') {
            throw new helpers_1.KError('Missing value when saving a setting', 400);
        }
        const userId = req.user.id;
        await models_1.Setting.updateByKey(userId, pair.key, pair.value);
        postSave(userId, pair.key, pair.value);
        res.status(200).end();
    }
    catch (err) {
        helpers_1.asyncErr(res, err, 'when saving a setting');
    }
}
exports.save = save;
