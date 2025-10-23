import regexEscape from 'regex-escape';

import { assert, makeLogger } from '../helpers';
import { ConfigGhostSettings, InstancePropertiesType } from '../lib/instance';
import DefaultSettings from '../shared/default-settings';
import { DEFAULT_ACCOUNT_ID } from '../../shared/settings';

import {
    Account,
    Alert,
    Category,
    Transaction,
    Budget,
    RecurringTransaction,
    AppliedRecurringTransaction,
    User,
    View,
    Setting,
    TransactionRule,
    TransactionRuleAction,
    TransactionRuleCondition,
} from '../models';

import { conditionTypesList } from './rules';

const log = makeLogger('controllers/helpers');

export type Remapping = { [key: number]: number };

// FIXME also contains all the fields from Access.
export interface ClientAccess {
    id: number;
    userId?: number;
    vendorId: string;
    enabled?: boolean;
    fields: { name: string; value: string }[];
    password?: string | null;
    session?: string | null;
    customLabel: string | null;
    label?: string | null;
}

export type AllData = {
    accounts: Account[];
    accesses: ClientAccess[];
    alerts: Alert[];
    categories: Category[];
    transactions: Transaction[];
    settings: Setting[];
    instance: InstancePropertiesType;
    // For exports only.
    budgets?: Budget[];
    transactionRules?: TransactionRule[];
    recurringTransactions?: RecurringTransaction[];
    appliedRecurringTransactions?: AppliedRecurringTransaction[];
    views: View[];
    user?: User;
};

// Sync function
export function cleanData(world: AllData) {
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
        delete (a as any).userId;
    }

    const categoryMap: Remapping = {};
    let nextCatId = 0;
    world.categories = world.categories || [];
    for (const c of world.categories) {
        categoryMap[c.id] = nextCatId;
        c.id = nextCatId++;
        delete (c as any).userId;
    }

    const viewMap: Remapping = {};
    let nextviewId = 0;
    world.views = world.views || [];
    for (const v of world.views) {
        viewMap[v.id] = nextviewId;
        v.id = nextviewId++;

        v.accounts = v.accounts
            .map(viewAcc => {
                const accId = viewAcc.accountId;
                if (typeof accountMap[accId] === 'undefined') {
                    log.warn(`unexpected account id: ${accId}`);
                    return null;
                }
                viewAcc.accountId = accountMap[accId];

                delete (viewAcc as any).id;

                return viewAcc;
            })
            .filter(viewAcc => viewAcc !== null);

        delete (v as any).userId;
    }

    // In case of unexpected accountIds that were removed, the accounts list might become empty.
    world.views = world.views.filter(v => v.accounts.length > 0);

    world.budgets = world.budgets || [];
    for (const b of world.budgets) {
        if (typeof categoryMap[b.categoryId] === 'undefined') {
            log.warn(`unexpected category id for a budget: ${b.categoryId}`);
            b.categoryId = -1;
        } else {
            b.categoryId = categoryMap[b.categoryId];
        }

        if (typeof viewMap[b.viewId] === 'undefined') {
            log.warn(`unexpected view id for a budget: ${b.viewId}`);
            b.viewId = -1;
        } else {
            b.viewId = viewMap[b.viewId];
        }

        delete (b as any).id;
        delete (b as any).userId;
    }

    // Remove budgets without category or view id.
    world.budgets = world.budgets.filter(b => b.categoryId >= 0 && b.viewId >= 0);

    world.transactions = world.transactions || [];
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
        delete (o as any).id;
        delete (o as any).userId;
    }

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

        delete (s as any).id;
        delete (s as any).userId;

        // Properly save the default account id if it exists.
        if (s.key === DEFAULT_ACCOUNT_ID && s.value !== DefaultSettings.get(DEFAULT_ACCOUNT_ID)) {
            const accountId = s.value as unknown as number;
            if (typeof accountMap[accountId] === 'undefined') {
                log.warn(`unexpected default account id: ${accountId}`);
                continue;
            } else {
                s.value = accountMap[accountId].toString();
            }
        }

        settings.push(s);
    }
    world.settings = settings;

    world.alerts = world.alerts || [];
    for (const a of world.alerts) {
        a.accountId = accountMap[a.accountId];
        delete (a as any).id;
        delete (a as any).userId;
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

        delete (rt as any).userId;
    }

    world.appliedRecurringTransactions = world.appliedRecurringTransactions || [];
    for (const art of world.appliedRecurringTransactions) {
        art.accountId = accountMap[art.accountId];
        art.recurringTransactionId = recurringTransactionsMap[art.recurringTransactionId];

        delete (art as any).id;
        delete (art as any).userId;
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
