"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("../helpers");
const banks_json_1 = __importDefault(require("../shared/banks.json"));
const BANK_HANDLERS = new Map();
function init() {
    const SOURCE_HANDLERS = {};
    function addBackend(handler) {
        if (typeof handler.SOURCE_NAME === 'undefined' ||
            typeof handler.fetchAccounts === 'undefined' ||
            typeof handler.fetchOperations === 'undefined') {
            throw new helpers_1.KError("Backend doesn't implement basic functionality.");
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
    // Connect static bank information to their backends.
    for (const bank of banks_json_1.default) {
        if (!bank.backend || !(bank.backend in SOURCE_HANDLERS)) {
            throw new helpers_1.KError('Bank handler not described or not imported.');
        }
        (0, helpers_1.assert)(!BANK_HANDLERS.has(bank.uuid), 'duplicate bank uuid');
        BANK_HANDLERS.set(bank.uuid, SOURCE_HANDLERS[bank.backend]);
    }
}
function getProvider(access) {
    return BANK_HANDLERS.get(access.vendorId);
}
exports.getProvider = getProvider;
init();
