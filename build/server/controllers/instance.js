"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.getWoobVersion = getWoobVersion;
exports.updateWoob = updateWoob;
exports.testEmail = testEmail;
exports.testNotification = testNotification;
exports.isDemoForced = isDemoForced;
exports.isDemoEnabled = isDemoEnabled;
const models_1 = require("../models");
const woob = __importStar(require("../providers/woob"));
const emailer_1 = __importDefault(require("../lib/emailer"));
const notifications_1 = require("../lib/notifications");
const errors_json_1 = require("../shared/errors.json");
const helpers_1 = require("../helpers");
const settings_1 = require("../shared/settings");
async function getWoobVersion(_req, res) {
    try {
        const version = await woob.getVersion(/* force = */ true);
        if (version === helpers_1.UNKNOWN_WOOB_VERSION) {
            throw new helpers_1.KError('cannot get woob version', 500, errors_json_1.WOOB_NOT_INSTALLED);
        }
        res.json({
            version,
            hasMinimalVersion: (0, helpers_1.checkMinimalWoobVersion)(version),
        });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when getting woob version');
    }
}
async function updateWoob(_req, res) {
    try {
        await woob.updateModules();
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating woob');
    }
}
async function testEmail(req, res) {
    try {
        const { id: userId } = req.user;
        const { email } = req.body;
        if (!email) {
            throw new helpers_1.KError('Missing email recipient address when sending a test email', 400);
        }
        const emailer = (0, emailer_1.default)();
        if (emailer !== null) {
            await emailer.sendTestEmail(userId, email);
        }
        else {
            throw new helpers_1.KError('No emailer found');
        }
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when trying to send an email');
    }
}
async function testNotification(req, res) {
    try {
        const { id: userId } = req.user;
        const { appriseUrl } = req.body;
        if (!appriseUrl) {
            throw new helpers_1.KError('Missing apprise url when sending a notification', 400);
        }
        await (0, notifications_1.sendTestNotification)(userId, appriseUrl);
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when trying to send a notification');
    }
}
function isDemoForced() {
    return process.kresus.forceDemoMode === true;
}
async function isDemoEnabled(userId) {
    return isDemoForced() || (await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.DEMO_MODE));
}
