"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bankVendorByUuid = bankVendorByUuid;

var _helpers = require("../helpers");

var _banks = _interopRequireDefault(require("../shared/banks.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let log = (0, _helpers.makeLogger)('lib/bank-vendors');

function bankVendorByUuid(uuid) {
  if (typeof uuid !== 'string') {
    log.warn('Bank.byUuid misuse: uuid must be a String');
  }

  return _banks.default.find(vendor => vendor.uuid === uuid);
}