"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const diff_list_1 = __importDefault(require("./diff-list"));
const duplicates_manager_1 = require("./duplicates-manager");
function isPerfectMatch(known, provided, params) {
    var _a;
    return ((0, duplicates_manager_1.getDuplicatePairScore)(known, provided, (_a = params === null || params === void 0 ? void 0 : params.perfectMatchMaxDateThreshold) !== null && _a !== void 0 ? _a : 0, false, false) === 1 &&
        known.type === provided.type &&
        !!known.isRecurrentTransaction === !!provided.isRecurrentTransaction &&
        !!known.createdByUser === !!provided.createdByUser);
}
const MAX_DATE_DIFFERENCE = 2;
/* getDuplicateScore will remove 0.1 for any label difference */
const MIN_SIMILARITY = 1 - 0.1;
function computePairScore(known, provided) {
    return (0, duplicates_manager_1.getDuplicatePairScore)(known, provided, MAX_DATE_DIFFERENCE, false);
}
const diffTransactions = (0, diff_list_1.default)(isPerfectMatch, computePairScore, MIN_SIMILARITY);
exports.default = diffTransactions;
