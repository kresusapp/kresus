"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = getProvider;
exports.getBankVendors = getBankVendors;
exports.bankVendorByUuid = bankVendorByUuid;
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("../helpers");
const BANK_HANDLERS = new Map();
const ALL_BANKS = [];
function init() {
    const SOURCE_HANDLERS = {};
    function addBackend(handler) {
        if (typeof handler.SOURCE_NAME === 'undefined' ||
            typeof handler.fetchAccounts === 'undefined' ||
            typeof handler.fetchTransactions === 'undefined') {
            throw new helpers_1.KError("Backend doesn't implement basic functionality.");
        }
        // Connect static bank information to their backends.
        const vendors = handler.getBankVendors();
        for (const bank of vendors) {
            (0, helpers_1.assert)(!BANK_HANDLERS.has(bank.uuid), 'duplicate bank uuid');
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
    for (const fileOrDirName of fs_1.default.readdirSync(__dirname)) {
        if (fileOrDirName === 'index.js' || fileOrDirName === 'index.ts') {
            // Skip this file :)
            continue;
        }
        // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
        const handler = require(`./${fileOrDirName}`);
        addBackend(handler);
    }
}
function getProvider(access) {
    return BANK_HANDLERS.get(access.vendorId);
}
function getBankVendors() {
    return ALL_BANKS;
}
function bankVendorByUuid(uuid) {
    return (0, helpers_1.unwrap)(ALL_BANKS.find(vendor => vendor.uuid === uuid));
}
init();
