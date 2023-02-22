"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable = exports.enable = exports.setupDemoMode = void 0;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const default_categories_json_1 = __importDefault(require("../shared/default-categories.json"));
const settings_1 = require("../shared/settings");
const instance_1 = require("./instance");
const accesses_1 = require("./accesses");
const translator_1 = require("../lib/translator");
async function setupDemoMode(userId) {
    const i18n = await (0, translator_1.getTranslator)(userId);
    // Create default categories, unless they already existed.
    const existingCategories = new Set((await models_1.Category.all(userId)).map(cat => cat.label));
    for (const category of default_categories_json_1.default) {
        if (existingCategories.has((0, helpers_1.translate)(i18n, category.label))) {
            continue;
        }
        await models_1.Category.create(userId, {
            label: (0, helpers_1.translate)(i18n, category.label),
            color: category.color,
        });
    }
    const response = await (0, accesses_1.createAndRetrieveData)(userId, {
        vendorId: 'demo',
        login: 'mylogin',
        password: 'couldnotcareless',
        customLabel: 'Demo bank',
    });
    (0, helpers_1.assert)(response.kind === 'value', "demo account shouldn't require a user action");
    const data = response.value;
    // Set the demo mode to true only if other actions succeeded.
    const isEnabled = await models_1.Setting.findOrCreateByKey(userId, settings_1.DEMO_MODE, 'true');
    if (isEnabled.value !== 'true') {
        // The setting already existed and has the wrong value.
        await models_1.Setting.updateByKey(userId, settings_1.DEMO_MODE, 'true');
    }
    return data;
}
exports.setupDemoMode = setupDemoMode;
async function enable(req, res) {
    try {
        const { id: userId } = req.user;
        const isEnabled = await (0, instance_1.isDemoEnabled)(userId);
        if (isEnabled) {
            throw new helpers_1.KError('Demo mode is already enabled, not enabling it.', 400);
        }
        const accesses = await models_1.Access.all(userId);
        if (accesses.length > 0) {
            throw new helpers_1.KError('Demo mode cannot be enabled if there already are accesses', 400);
        }
        const data = await setupDemoMode(userId);
        res.status(201).json(data);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when enabling demo mode');
    }
}
exports.enable = enable;
async function disable(req, res) {
    try {
        const { id: userId } = req.user;
        if ((0, instance_1.isDemoForced)()) {
            throw new helpers_1.KError('Demo mode is forced at the server level, not disabling it.', 400);
        }
        const isEnabled = await (0, instance_1.isDemoEnabled)(userId);
        if (!isEnabled) {
            throw new helpers_1.KError('Demo mode was not enabled, not disabling it.', 400);
        }
        const accesses = await models_1.Access.all(userId);
        for (const acc of accesses) {
            await (0, accesses_1.destroyWithData)(userId, acc);
        }
        // Keep the categories (and rules), in case the user created
        // interesting ones. Delete all the budgets, though.
        await models_1.Budget.destroyAll(userId);
        // Only reset the setting value if all the destroy actions succeeded.
        await models_1.Setting.updateByKey(userId, settings_1.DEMO_MODE, 'false');
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when disabling demo mode');
    }
}
exports.disable = disable;
