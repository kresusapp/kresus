"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testing = void 0;
const helpers_1 = require("../helpers");
const diff_list_1 = __importDefault(require("./diff-list"));
const manual_1 = require("../providers/manual");
function isPerfectMatch(known, provided) {
    (0, helpers_1.assert)(known.accessId === provided.accessId, 'data inconsistency');
    (0, helpers_1.assert)(typeof provided.label !== 'undefined', 'account label must be defined at this point');
    const newLabel = known.label.replace(/ /g, '').toLowerCase();
    const oldLabel = provided.label.replace(/ /g, '').toLowerCase();
    return (oldLabel === newLabel &&
        provided.vendorAccountId === known.vendorAccountId &&
        ((!provided.iban && !known.iban) || provided.iban === known.iban) &&
        provided.currency === known.currency &&
        provided.type === known.type);
}
const HEURISTICS = {
    SAME_LABEL: 5,
    SAME_ACCOUNT_NUMBER: 5,
    SAME_IBAN: 1,
    SAME_CURRENCY: 1,
    SAME_TYPE: 1,
};
// The minimum similarity to consider two accounts are the same. We can't only rely on the IBAN:
// some banks sometimes provide two different accounts with the same IBAN.
const MIN_SIMILARITY = HEURISTICS.SAME_IBAN + HEURISTICS.SAME_CURRENCY + HEURISTICS.SAME_TYPE + 1;
function computePairScore(known, provided, vendorId) {
    (0, helpers_1.assert)(typeof provided.label !== 'undefined', 'account label must be defined at this point');
    // Normalize data.
    const oldLabel = provided.label.replace(/ /g, '').toLowerCase();
    const newLabel = known.label.replace(/ /g, '').toLowerCase();
    // The manual bank accounts labels might change when the locale changes. Suppose the label
    // is identical if the access is the same and rely on the account number.
    let labelScore = 0;
    if (oldLabel === newLabel ||
        (known.vendorAccountId === provided.vendorAccountId &&
            known.accessId === provided.accessId &&
            vendorId === manual_1.SOURCE_NAME)) {
        labelScore = HEURISTICS.SAME_LABEL;
    }
    const accountIdScore = known.vendorAccountId === provided.vendorAccountId ? HEURISTICS.SAME_ACCOUNT_NUMBER : 0;
    const ibanScore = known.iban === provided.iban ? HEURISTICS.SAME_IBAN : 0;
    const currencyScore = known.currency === provided.currency ? HEURISTICS.SAME_CURRENCY : 0;
    const typeScore = known.type === provided.type ? HEURISTICS.SAME_TYPE : 0;
    return labelScore + accountIdScore + ibanScore + currencyScore + typeScore;
}
const diffAccount = (0, diff_list_1.default)(isPerfectMatch, computePairScore, MIN_SIMILARITY);
exports.default = diffAccount;
exports.testing = {
    computePairScore,
};
