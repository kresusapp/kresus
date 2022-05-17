"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.amountAndLabelAndDateMatch = void 0;
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("../helpers");
const diff_list_1 = __importDefault(require("./diff-list"));
function amountAndLabelAndDateMatch(known, provided) {
    (0, helpers_1.assert)(typeof provided.rawLabel !== 'undefined', 'a new transaction must have a rawLabel');
    (0, helpers_1.assert)(typeof provided.date !== 'undefined', 'a new transaction must have a date');
    (0, helpers_1.assert)(typeof provided.amount !== 'undefined', 'a new transaction must have a amount');
    const oldRawLabel = known.rawLabel.replace(/ /g, '').toLowerCase();
    const oldMoment = (0, moment_1.default)(known.date);
    const newRawLabel = provided.rawLabel.replace(/ /g, '').toLowerCase();
    const newMoment = (0, moment_1.default)(provided.date);
    return (Math.abs(known.amount - provided.amount) < 0.001 &&
        oldRawLabel === newRawLabel &&
        oldMoment.isSame(newMoment, 'day'));
}
exports.amountAndLabelAndDateMatch = amountAndLabelAndDateMatch;
function isPerfectMatch(known, provided) {
    return amountAndLabelAndDateMatch(known, provided) && known.type === provided.type;
}
const HEURISTICS = {
    SAME_DATE: 5,
    SAME_AMOUNT: 5,
    SAME_LABEL: 5,
    SAME_TYPE: 1,
};
const MAX_DATE_DIFFERENCE = 2;
const MIN_SIMILARITY = HEURISTICS.SAME_DATE + HEURISTICS.SAME_AMOUNT + 1;
function computePairScore(known, provided) {
    (0, helpers_1.assert)(typeof provided.rawLabel !== 'undefined', 'a new transaction must have a rawLabel');
    (0, helpers_1.assert)(typeof provided.amount !== 'undefined', 'a new transaction must have a amount');
    const knownMoment = (0, moment_1.default)(known.date);
    const providedMoment = (0, moment_1.default)(provided.date);
    const diffDate = Math.abs(knownMoment.diff(providedMoment, 'days'));
    let dateScore = 0;
    if (diffDate === 0) {
        dateScore = HEURISTICS.SAME_DATE;
    }
    else if (diffDate <= MAX_DATE_DIFFERENCE) {
        dateScore = HEURISTICS.SAME_DATE / (1 + diffDate);
    }
    const diffAmount = Math.abs(known.amount - provided.amount);
    const amountScore = diffAmount < 0.001 ? HEURISTICS.SAME_AMOUNT : 0;
    let typeScore = 0;
    if (provided.type === helpers_1.UNKNOWN_OPERATION_TYPE) {
        typeScore = HEURISTICS.SAME_TYPE / 2;
    }
    else if (known.type === provided.type) {
        typeScore = HEURISTICS.SAME_TYPE;
    }
    const oldRawLabel = provided.rawLabel.replace(/ /g, '').toLowerCase();
    const newRawLabel = known.rawLabel.replace(/ /g, '').toLowerCase();
    const labelScore = oldRawLabel === newRawLabel ? HEURISTICS.SAME_LABEL : 0;
    return amountScore + dateScore + typeScore + labelScore;
}
const diffTransactions = (0, diff_list_1.default)(isPerfectMatch, computePairScore, MIN_SIMILARITY);
exports.default = diffTransactions;
