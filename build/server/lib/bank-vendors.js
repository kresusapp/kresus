"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const banks_json_1 = __importDefault(require("../shared/banks.json"));
let log = helpers_1.makeLogger('lib/bank-vendors');
function bankVendorByUuid(uuid) {
    if (typeof uuid !== 'string') {
        log.warn('Bank.byUuid misuse: uuid must be a String');
    }
    return helpers_1.unwrap(banks_json_1.default.find(vendor => vendor.uuid === uuid));
}
exports.bankVendorByUuid = bankVendorByUuid;
