"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankVendorByUuid = void 0;
const helpers_1 = require("../helpers");
const banks_json_1 = __importDefault(require("../shared/banks.json"));
function bankVendorByUuid(uuid) {
    return (0, helpers_1.unwrap)(banks_json_1.default.find(vendor => vendor.uuid === uuid));
}
exports.bankVendorByUuid = bankVendorByUuid;
