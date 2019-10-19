import regexEscape from 'regex-escape';

import { makeLogger } from '../../helpers';
import { ConfigGhostSettings } from '../../lib/ghost-settings';
import DefaultSettings from '../../shared/default-settings';

let log = makeLogger('controllers/helpers');

// Sync function
export function cleanData(world) {
    let accessMap = {};
    let nextAccessId = 0;

    world.accesses = world.accesses || [];
    for (let a of world.accesses) {
        accessMap[a.id] = nextAccessId;
        a.id = nextAccessId++;
    }

    let accountMap = {};
    let nextAccountId = 0;
    world.accounts = world.accounts || [];
    for (let a of world.accounts) {
        a.accessId = accessMap[a.accessId];
        accountMap[a.id] = nextAccountId;
        a.id = nextAccountId++;
    }

    let categoryMap = {};
    let nextCatId = 0;
    world.categories = world.categories || [];
    for (let c of world.categories) {
        categoryMap[c.id] = nextCatId;
        c.id = nextCatId++;
    }

    world.budgets = world.budgets || [];
    for (let b of world.budgets) {
        if (typeof categoryMap[b.categoryId] === 'undefined') {
            log.warn(`unexpected category id for a budget: ${b.categoryId}`);
        } else {
            b.categoryId = categoryMap[b.categoryId];
        }

        delete b.id;
    }

    world.operations = world.operations || [];
    for (let o of world.operations) {
        if (typeof o.categoryId !== 'undefined') {
            let cid = o.categoryId;
            if (typeof categoryMap[cid] === 'undefined') {
                log.warn(`unexpected category id for a transaction: ${cid}`);
            } else {
                o.categoryId = categoryMap[cid];
            }
        }

        o.accountId = accountMap[o.accountId];

        // Strip away id.
        delete o.id;

        // Remove attachments, if there are any.
        delete o.attachments;
        delete o.binary;
    }

    world.settings = world.settings || [];
    let settings = [];
    for (let s of world.settings) {
        if (!DefaultSettings.has(s.key)) {
            log.warn(`Not exporting setting "${s.key}", it does not have a default value.`);
            continue;
        }

        if (ConfigGhostSettings.has(s.key)) {
            // Don't export ghost settings, since they're computed at runtime.
            continue;
        }

        delete s.id;

        // Properly save the default account id if it exists.
        if (
            s.key === 'default-account-id' &&
            s.value !== DefaultSettings.get('default-account-id')
        ) {
            let accountId = s.value;
            if (typeof accountMap[accountId] === 'undefined') {
                log.warn(`unexpected default account id: ${accountId}`);
                continue;
            } else {
                s.value = accountMap[accountId];
            }
        }

        settings.push(s);
    }
    world.settings = settings;

    world.alerts = world.alerts || [];
    for (let a of world.alerts) {
        a.accountId = accountMap[a.accountId];
        delete a.id;
    }

    return world;
}

export function obfuscatePasswords(string, passwords) {
    // Prevents the application of the regexp s//*******/g
    if (!passwords.size) {
        return string;
    }

    const regex = [...passwords].map(k => regexEscape(k)).join('|');

    // Always return a fixed width string
    return string.replace(new RegExp(`(${regex})`, 'gm'), '********');
}

export function obfuscateKeywords(string, keywords) {
    // Prevents the application of the regexp s//*******/g
    if (!keywords.size) {
        return string;
    }
    const regex = [...keywords].map(k => regexEscape(k)).join('|');
    return string.replace(new RegExp(`(${regex})`, 'gm'), (all, keyword) =>
        keyword.substr(-3).padStart(keyword.length, '*')
    );
}
