"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeWith = mergeWith;

var _helpers = require("../helpers");

const hasCategory = op => typeof op.categoryId === 'string';

const hasType = op => typeof op.type !== 'undefined' && op.type !== _helpers.UNKNOWN_OPERATION_TYPE;

const hasCustomLabel = op => typeof op.customLabel === 'string';

const hasBudgetDate = op => typeof op.budgetDate !== 'undefined' && op.budgetDate !== null;

function mergeWith(target, other) {
  let update = {}; // Always trigger an update for the import date, to avoid duplicate
  // transactions to appear in reports around the date where the duplicate
  // has been imported.
  // This should be always true, but we stay defensive here.

  if (typeof other.dateImport !== 'undefined' && other.dateImport !== null) {
    update.dateImport = other.dateImport;
  }

  if (!hasCategory(target) && hasCategory(other)) {
    update.categoryId = other.categoryId;
  }

  if (!hasType(target) && hasType(other)) {
    update.type = other.type;
  }

  if (!hasCustomLabel(target) && hasCustomLabel(other)) {
    update.customLabel = other.customLabel;
  }

  if (!hasBudgetDate(target) && hasBudgetDate(other)) {
    update.budgetDate = other.budgetDate;
  }

  return update;
}