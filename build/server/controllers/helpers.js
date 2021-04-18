"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obfuscateKeywords = exports.obfuscatePasswords = exports.cleanData = void 0;
const regex_escape_1 = __importDefault(require("regex-escape"));
const helpers_1 = require("../helpers");
const instance_1 = require("../lib/instance");
const default_settings_1 = __importDefault(require("../shared/default-settings"));
const settings_1 = require("../../shared/settings");
const log = helpers_1.makeLogger('controllers/helpers');
// Sync function
function cleanData(world) {
    const accessMap = {};
    let nextAccessId = 0;
    world.accesses = world.accesses || [];
    for (const a of world.accesses) {
        accessMap[a.id] = nextAccessId;
        a.id = nextAccessId++;
        delete a.userId;
    }
    const accountMap = {};
    let nextAccountId = 0;
    world.accounts = world.accounts || [];
    for (const a of world.accounts) {
        a.accessId = accessMap[a.accessId];
        accountMap[a.id] = nextAccountId;
        a.id = nextAccountId++;
        delete a.userId;
    }
    const categoryMap = {};
    let nextCatId = 0;
    world.categories = world.categories || [];
    for (const c of world.categories) {
        categoryMap[c.id] = nextCatId;
        c.id = nextCatId++;
        delete c.userId;
    }
    world.budgets = world.budgets || [];
    for (const b of world.budgets) {
        if (typeof categoryMap[b.categoryId] === 'undefined') {
            log.warn(`unexpected category id for a budget: ${b.categoryId}`);
        }
        else {
            b.categoryId = categoryMap[b.categoryId];
        }
        delete b.id;
        delete b.userId;
    }
    world.operations = world.operations || [];
    for (const o of world.operations) {
        if (o.categoryId !== null) {
            const cid = o.categoryId;
            if (typeof categoryMap[cid] === 'undefined') {
                log.warn(`unexpected category id for a transaction: ${cid}`);
            }
            else {
                o.categoryId = categoryMap[cid];
            }
        }
        o.accountId = accountMap[o.accountId];
        // Strip away id.
        delete o.id;
        delete o.userId;
        // Remove attachments, if there are any.
        delete o.attachments;
        delete o.binary;
    }
    world.settings = world.settings || [];
    const settings = [];
    for (const s of world.settings) {
        if (!default_settings_1.default.has(s.key)) {
            log.warn(`Not exporting setting "${s.key}", it does not have a default value.`);
            continue;
        }
        if (instance_1.ConfigGhostSettings.has(s.key)) {
            // Don't export ghost settings, since they're computed at runtime.
            continue;
        }
        delete s.id;
        delete s.userId;
        // Properly save the default account id if it exists.
        if (s.key === settings_1.DEFAULT_ACCOUNT_ID && s.value !== default_settings_1.default.get(settings_1.DEFAULT_ACCOUNT_ID)) {
            const accountId = s.value;
            if (typeof accountMap[accountId] === 'undefined') {
                log.warn(`unexpected default account id: ${accountId}`);
                continue;
            }
            else {
                s.value = accountMap[accountId];
            }
        }
        settings.push(s);
    }
    world.settings = settings;
    world.alerts = world.alerts || [];
    for (const a of world.alerts) {
        a.accountId = accountMap[a.accountId];
        delete a.id;
        delete a.userId;
    }
    world.transactionRules = world.transactionRules || [];
    for (const rule of world.transactionRules) {
        for (const condition of rule.conditions) {
            switch (condition.type) {
                case 'label_matches_text':
                case 'label_matches_regexp':
                    // Nothing to do.
                    break;
                default:
                    helpers_1.assert(false, 'unhandled transaction rule condition in exports cleanup');
            }
            // Remove non-important fields; they'll get re-created on imports.
            delete condition.ruleId;
            delete condition.userId;
            delete condition.id;
        }
        for (const action of rule.actions) {
            // Replace the category id by the mapped id in the categorize
            // actions.
            switch (action.type) {
                case 'categorize':
                    helpers_1.assert(action.categoryId !== null, 'category must be set for a categorize action');
                    action.categoryId = categoryMap[action.categoryId];
                    break;
                default:
                    helpers_1.assert(false, 'unhandled transaction rule action in exports cleanup');
            }
            // Remove non-important fields; they'll get re-created on imports.
            delete action.ruleId;
            delete action.userId;
            delete action.id;
        }
        delete rule.userId;
        delete rule.id;
    }
    return world;
}
exports.cleanData = cleanData;
function obfuscatePasswords(string, passwords) {
    // Prevents the application of the regexp s//*******/g
    if (!passwords.size) {
        return string;
    }
    const regex = [...passwords].map(k => regex_escape_1.default(`${k}`)).join('|');
    // Always return a fixed width string
    return string.replace(new RegExp(`(${regex})`, 'gm'), '********');
}
exports.obfuscatePasswords = obfuscatePasswords;
function obfuscateKeywords(string, keywords) {
    // Prevents the application of the regexp s//*******/g
    if (!keywords.size) {
        return string;
    }
    const regex = [...keywords].map(k => regex_escape_1.default(`${k}`)).join('|');
    return string.replace(new RegExp(`(${regex})`, 'gm'), (_all, keyword) => keyword.substr(-3).padStart(keyword.length, '*'));
}
exports.obfuscateKeywords = obfuscateKeywords;
