var Helpers = require('./Helpers');
var has = Helpers.has;
var maybeHas = Helpers.maybeHas;
var NONE_CATEGORY_ID = Helpers.NONE_CATEGORY_ID;

exports.Bank = function Bank(arg) {
    this.id   = has(arg, 'id')   && arg.id;
    this.name = has(arg, 'name') && arg.name;
    this.uuid = has(arg, 'uuid') && arg.uuid;

    this.accounts = [];
}

exports.Account = function Account(arg) {
    this.bank          = has(arg, 'bank') && arg.bank;
    this.bankAccess    = has(arg, 'bankAccess') && arg.bankAccess;
    this.title         = has(arg, 'title') && arg.title;
    this.accountNumber = has(arg, 'accountNumber') && arg.accountNumber;
    this.initialAmount = has(arg, 'initialAmount') && arg.initialAmount;
    this.lastChecked   = has(arg, 'lastChecked') && new Date(arg.lastChecked);
    this.id            = has(arg, 'id') && arg.id;
    this.amount        = has(arg, 'amount') && arg.amount;

    this.operations = [];
}

function Operation(arg) {
    this.bankAccount = has(arg, 'bankAccount') && arg.bankAccount;
    this.title       = has(arg, 'title') && arg.title;
    this.date        = has(arg, 'date') && new Date(arg.date);
    this.amount      = has(arg, 'amount') && arg.amount;
    this.raw         = has(arg, 'raw') && arg.raw;
    this.dateImport  = (maybeHas(arg, 'dateImport') && new Date(arg.dateImport)) || 0;
    this.id          = has(arg, 'id') && arg.id;
    this.categoryId  = arg.categoryId || NONE_CATEGORY_ID;
}

exports.Operation = Operation;

function Category(arg) {
    this.title = has(arg, 'title') && arg.title;
    this.id = has(arg, 'id') && arg.id;

    // Optional
    this.parentId = arg.parentId;
}

exports.Category = Category;
