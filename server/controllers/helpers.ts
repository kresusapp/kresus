import regexEscape from 'regex-escape';

import { assert, makeLogger } from '../helpers';
import { ConfigGhostSettings } from '../lib/instance';
import DefaultSettings from '../shared/default-settings';
import { DEFAULT_ACCOUNT_ID } from '../../shared/settings';

import {
    Setting,
    TransactionRule,
    TransactionRuleAction,
    TransactionRuleCondition,
} from '../models';

import { conditionTypesList } from './rules';

const log = makeLogger('controllers/helpers');

export type Remapping = { [key: number]: number };

// Sync function
export function cleanData(world: any) {
    const accessMap: Remapping = {};
    let nextAccessId = 0;

    world.accesses = world.accesses || [];
    for (const a of world.accesses) {
        accessMap[a.id] = nextAccessId;
        a.id = nextAccessId++;
        delete a.userId;
    }

    const accountMap: Remapping = {};
    let nextAccountId = 0;
    world.accounts = world.accounts || [];
    for (const a of world.accounts) {
        a.accessId = accessMap[a.accessId];
        accountMap[a.id] = nextAccountId;
        a.id = nextAccountId++;
        delete a.userId;
    }

    const categoryMap: Remapping = {};
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
        } else {
            b.categoryId = categoryMap[b.categoryId];
        }
        delete b.id;
        delete b.userId;
    }

    world.transactions = world.transactions || world.operations || [];
    for (const o of world.transactions) {
        if (o.categoryId !== null) {
            const cid = o.categoryId;
            if (typeof categoryMap[cid] === 'undefined') {
                log.warn(`unexpected category id for a transaction: ${cid}`);
            } else {
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
    delete world.operations;

    world.settings = world.settings || [];
    const settings: Setting[] = [];
    for (const s of world.settings) {
        if (!DefaultSettings.has(s.key)) {
            log.warn(`Not exporting setting "${s.key}", it does not have a default value.`);
            continue;
        }

        if (ConfigGhostSettings.has(s.key)) {
            // Don't export ghost settings, since they're computed at runtime.
            continue;
        }

        delete s.id;
        delete s.userId;

        // Properly save the default account id if it exists.
        if (s.key === DEFAULT_ACCOUNT_ID && s.value !== DefaultSettings.get(DEFAULT_ACCOUNT_ID)) {
            const accountId = s.value;
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
    for (const a of world.alerts) {
        a.accountId = accountMap[a.accountId];
        delete a.id;
        delete a.userId;
    }

    world.transactionRules = world.transactionRules || [];
    for (const rule of world.transactionRules as TransactionRule[]) {
        for (const condition of rule.conditions as TransactionRuleCondition[]) {
            if (!conditionTypesList.includes(condition.type)) {
                assert(false, 'unhandled transaction rule condition in exports cleanup');
            }

            // Remove non-important fields; they'll get re-created on imports.
            delete (condition as any).ruleId;
            delete (condition as any).userId;
            delete (condition as any).id;
        }

        for (const action of rule.actions as TransactionRuleAction[]) {
            // Replace the category id by the mapped id in the categorize
            // actions.
            switch (action.type) {
                case 'categorize':
                    assert(
                        action.categoryId !== null,
                        'category must be set for a categorize action'
                    );
                    action.categoryId = categoryMap[action.categoryId];
                    break;
                default:
                    assert(false, 'unhandled transaction rule action in exports cleanup');
            }

            // Remove non-important fields; they'll get re-created on imports.
            delete (action as any).ruleId;
            delete (action as any).userId;
            delete (action as any).id;
        }

        delete (rule as any).userId;
        delete (rule as any).id;
    }

    const recurringTransactionsMap: Remapping = {};
    let nextRecurringTransactionId = 0;
    world.recurringTransactions = world.recurringTransactions || [];
    for (const rt of world.recurringTransactions) {
        rt.accountId = accountMap[rt.accountId];
        recurringTransactionsMap[rt.id] = nextRecurringTransactionId;
        rt.id = nextRecurringTransactionId++;
        delete rt.userId;
    }

    world.appliedRecurringTransactions = world.appliedRecurringTransactions || [];
    for (const art of world.appliedRecurringTransactions) {
        art.accountId = accountMap[art.accountId];
        art.recurringTransactionId = recurringTransactionsMap[art.recurringTransactionId];
        delete art.id;
        delete art.userId;
    }

    return world;
}

export function obfuscatePasswords(string: string, passwords: Set<string>) {
    // Prevents the application of the regexp s//*******/g
    if (!passwords.size) {
        return string;
    }

    const regex = [...passwords].map(k => regexEscape(`${k}`)).join('|');

    // Always return a fixed width string
    return string.replace(new RegExp(`(${regex})`, 'gm'), '********');
}

export function obfuscateKeywords(string: string, keywords: Set<string>) {
    // Prevents the application of the regexp s//*******/g
    if (!keywords.size) {
        return string;
    }
    const regex = [...keywords].map(k => regexEscape(`${k}`)).join('|');
    return string.replace(new RegExp(`(${regex})`, 'gm'), (_all, keyword) =>
        keyword.substr(-3).padStart(keyword.length, '*')
    );
}

export function obfuscateEmails(string: string) {
    // Prevents the application of the regexp s//*******/g
    if (!string) {
        return string;
    }

    // Obviously this is not RFC 5322 compliant but a compliant regex
    // would be a mess and slow.
    return string.replace(/[\w+.]+@\w+\.\w+/gim, '*******@****.***');
}
