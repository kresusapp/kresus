import fs from 'fs';

import { Access } from '../models';
import { assert, KError, unwrap } from '../helpers';

import { UserActionResponse } from '../shared/types';
import { BankVendor } from '../../shared/types';

const BANK_HANDLERS = new Map<string, Provider>();
const ALL_BANKS: BankVendor[] = [];

export interface ProviderTransaction {
    account: string;
    amount: string;
    date: Date;
    label: string;
    rawLabel: string;
    type?: number;
    // eslint-disable-next-line camelcase
    debit_date?: Date;
}

export interface ProviderTransactionResponse {
    kind: 'values';
    values: ProviderTransaction[];
}

export interface ProviderAccount {
    vendorAccountId: string;
    label: string;
    balance?: string;
    iban?: string;
    type?: number;
    currency?: string;
}

export interface ProviderAccountResponse {
    kind: 'values';
    values: ProviderAccount[];
}

export interface FetchAccountsOptions {
    access: Access;
    debug: boolean;
    update: boolean;
    isInteractive: boolean;
    userActionFields: Record<string, string> | null;
}

export interface FetchTransactionsOptions {
    access: Access;
    debug: boolean;
    fromDate: Date | null;
    isInteractive: boolean;
    userActionFields: Record<string, string> | null;
}

export interface SessionManager {
    save(access: Access, session: Record<string, unknown>): Promise<void>;
    reset(access: Access): Promise<void>;
    read(access: Access): Promise<Record<string, unknown> | undefined>;
}

export interface Provider {
    SOURCE_NAME: string;
    getBankVendors: () => Omit<BankVendor, 'backend'>[];
    fetchAccounts: (
        opts: FetchAccountsOptions,
        session: SessionManager
    ) => Promise<ProviderAccountResponse | UserActionResponse>;
    fetchTransactions: (
        opts: FetchTransactionsOptions,
        session: SessionManager
    ) => Promise<ProviderTransactionResponse | UserActionResponse>;
}

function init() {
    const SOURCE_HANDLERS: { [k: string]: Provider } = {};

    function addBackend(handler: Provider) {
        if (
            typeof handler.SOURCE_NAME === 'undefined' ||
            typeof handler.fetchAccounts === 'undefined' ||
            typeof handler.fetchTransactions === 'undefined'
        ) {
            throw new KError("Backend doesn't implement basic functionality.");
        }

        // Connect static bank information to their backends.
        const vendors = handler.getBankVendors();
        for (const bank of vendors) {
            assert(!BANK_HANDLERS.has(bank.uuid), 'duplicate bank uuid');
            BANK_HANDLERS.set(bank.uuid, handler);
            ALL_BANKS.push({
                ...bank,
                backend: handler.SOURCE_NAME,
            });
        }

        SOURCE_HANDLERS[handler.SOURCE_NAME] = handler;
    }

    // Go through all the files in this directory, and try to import them as
    // bank handlers.
    for (const fileOrDirName of fs.readdirSync(__dirname)) {
        if (fileOrDirName === 'index.js' || fileOrDirName === 'index.ts') {
            // Skip this file :)
            continue;
        }

        // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
        const handler: Provider = require(`./${fileOrDirName}`);

        addBackend(handler);
    }
}

export function getProvider(access: Access) {
    return BANK_HANDLERS.get(access.vendorId);
}

export function getBankVendors() {
    return ALL_BANKS;
}

export function bankVendorByUuid(uuid: string) {
    return unwrap(ALL_BANKS.find(vendor => vendor.uuid === uuid));
}

init();
