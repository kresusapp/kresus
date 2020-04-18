"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const default_categories_json_1 = __importDefault(require("../shared/default-categories.json"));
const settings_1 = require("./settings");
const accesses_1 = require("./accesses");
async function setupDemoMode(userId) {
    // Create default categories.
    for (let category of default_categories_json_1.default) {
        await models_1.Category.create(userId, {
            label: helpers_1.translate(category.label),
            color: category.color
        });
    }
    const data = await accesses_1.createAndRetrieveData(userId, {
        vendorId: 'demo',
        login: 'mylogin',
        password: 'couldnotcareless',
        customLabel: 'Demo bank'
    });
    // Set the demo mode to true only if other operations succeeded.
    const isEnabled = await models_1.Setting.findOrCreateByKey(userId, 'demo-mode', 'true');
    if (isEnabled.value !== 'true') {
        // The setting already existed and has the wrong value.
        await models_1.Setting.updateByKey(userId, 'demo-mode', 'true');
    }
    return data;
}
exports.setupDemoMode = setupDemoMode;
async function enable(req, res) {
    try {
        let { id: userId } = req.user;
        let isEnabled = await settings_1.isDemoEnabled(userId);
        if (isEnabled) {
            throw new helpers_1.KError('Demo mode is already enabled, not enabling it.', 400);
        }
        const data = await setupDemoMode(userId);
        res.status(201).json(data);
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when enabling demo mode');
    }
}
exports.enable = enable;
async function disable(req, res) {
    try {
        let { id: userId } = req.user;
        if (settings_1.isDemoForced()) {
            throw new helpers_1.KError('Demo mode is forced at the server level, not disabling it.', 400);
        }
        const isEnabled = await settings_1.isDemoEnabled(userId);
        if (!isEnabled) {
            throw new helpers_1.KError('Demo mode was not enabled, not disabling it.', 400);
        }
        const accesses = await models_1.Access.all(userId);
        for (let acc of accesses) {
            await accesses_1.destroyWithData(userId, acc);
        }
        // Delete categories and associated budgets.
        const categories = await models_1.Category.all(userId);
        for (let cat of categories) {
            await models_1.Budget.destroyForCategory(userId, cat.id /* no replacement category */);
            await models_1.Category.destroy(userId, cat.id);
        }
        // Only reset the setting value if all the destroy operations
        // succeeded.
        await models_1.Setting.updateByKey(userId, 'demo-mode', 'false');
        res.status(200).end();
    }
    catch (err) {
        return helpers_1.asyncErr(res, err, 'when disabling demo mode');
    }
}
exports.disable = disable;
