var Helpers = require('../Helpers');
var xhrError = Helpers.xhrError;
var assert = Helpers.assert;
var debug = Helpers.debug;
var NYI = Helpers.NYI;

var Models = require('../Models');
var Account = Models.Account;
var Bank = Models.Bank;
var Category = Models.Category;
var Operation = Models.Operation;

var banks = {
    0: {
        id: 0,
        name: 'Banque de Donnees',
        uuid: '12345',
        meta_firstAccount: 42,
        accounts: {
            42: {
                bank: 0,
                bankAccess: 'bank access for account 42',
                title: 'Compte principal',
                accountNumber: '0147200001',
                initialAmount: 500,
                lastChecked: new Date(),
                id: 42,
                amount: 150,
                operations: [
                    {
                        bankAccount: 42,
                        title: 'virement',
                        date: new Date(),
                        amount: 20,
                        raw: 'virement raw',
                        dateImport: new Date() - 3000,
                        id: 421,
                        categoryId: null
                    },
                    {
                        bankAccount: 42,
                        title: 'paiement',
                        date: new Date(),
                        amount: -10,
                        raw: 'paiement raw',
                        dateImport: new Date() - 4000,
                        id: 422,
                        categoryId: null
                    },
                ]
            },

            43: {
                bank: 0,
                bankAccess: 'bank access for account 43',
                title: 'Compte cheque',
                accountNumber: '123456789',
                initialAmount: 0,
                lastChecked: new Date(),
                id: 43,
                amount: 850,
                operations: [
                    {
                        bankAccount: 43,
                        title: 'virement interne',
                        date: new Date(),
                        amount: 100,
                        raw: 'virement interne raw',
                        dateImport: new Date() - 1000,
                        id: 431,
                        categoryId: null
                    },
                    {
                        bankAccount: 43,
                        title: 'virement interne 2',
                        date: new Date(),
                        amount: -100,
                        raw: 'virement interne 2 raw',
                        dateImport: new Date() - 1000,
                        id: 432,
                        categoryId: null
                    },
                ]
            },
        }
    },
    1: {
        id: 1,
        name: 'Credit Pas Credible',
        uuid: '67890',
        meta_firstAccount: 1337,
        accounts: {
            1337: {
                bank: 1,
                bankAccess: 'bank access for account 1337',
                title: 'Compte jeune',
                accountNumber: '13371337',
                initialAmount: 240.32,
                lastChecked: new Date(),
                id: 1337,
                amount: 28850, // be sure not to trust this!
                operations: [
                    {
                        bankAccount: 1337,
                        title: 'interets',
                        date: new Date(),
                        amount: 13.37,
                        raw: 'interets raw',
                        dateImport: new Date() - 1000,
                        id: 13371,
                        categoryId: null
                    },
                    {
                        bankAccount: 1337,
                        title: 'frais bancaires',
                        date: new Date(),
                        amount: -5.35,
                        raw: 'frais bancaires raw',
                        dateImport: new Date() - 1000,
                        id: 13372,
                        categoryId: 0
                    },
                ]
            }
        }
    }
};

var categories = [
    {
        title: 'frais bancaires',
        id: 0
    },
    {
        title: 'depenses courantes',
        id: 1
    }
];
var nextCategoryId = 2;

function FindAccountById(accountId) {
    var found = null;
    for (var id in banks) {
        if (typeof banks[id].accounts[accountId] !== 'undefined') {
            return banks[id].accounts[accountId];
        }
    }
    throw 'account not found';
}

function FindOperationById(operationId) {
    var found = null;
    for (var bid in banks) {
        for (var aid in banks[bid].accounts) {
            var ops = banks[bid].accounts[aid].operations;
            for (var i = 0; i < ops.length; i++) {
                if (ops[i].id === operationId) {
                    return ops[i];
                }
            }
        }
    }
    throw 'op not found';
}

module.exports = {
    // TODO implement stub
    getStaticBanks: NYI,

    getBanks: function(cb) {
        setTimeout(function() {
            var ret = {};
            for (var id in banks)
                ret[id] = new Bank(banks[id]);
            cb(ret, 0);
        }, 0);
    },

    getAccounts: function(bankId, cb) {
        setTimeout(function() {
            var ret = {};
            for (var id in banks[bankId].accounts) {
                var acc = banks[bankId].accounts[id];
                ret[acc.id] = new Account(acc);
            }
            cb(bankId, ret, banks[bankId].meta_firstAccount);
        }, 0);
    },

    getOperations: function(accountId, cb) {
        setTimeout(function() {
            var found = FindAccountById(accountId);
            cb(found.operations.map(function(pod) {
                return new Operation(pod);
            }));
        }, 0);
    },

    // TODO implement stub
    deleteBank: NYI,

    // TODO implement stub
    deleteAccount: NYI,

    deleteOperation: function(operationId, cb) {
        var found = FindOperationById(operationId);
        delete found;
        setTimeout(cb, 0);
    },

    getNewOperations: function(accountId, cb) {
        var found = FindAccountById(accountId);
        setTimeout(function() {
            cb(new Account(found));
        }, 0);
    },

    getCategories: function(cb) {
        setTimeout(function() {
            cb(categories.map(function(pod) { return new Category(pod); }));
        }, 0);
    },

    addCategory: function(category, cb) {
        category.id = nextCategoryId++;
        categories.push(category);
        setTimeout(cb, 0);
    },

    updateCategory: function(id, category, cb) {
        var found = null;
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].id == id) {
                found = categories[i];
                found.title = category.title;
                break;
            }
        }
        setTimeout(cb, 0);
    },

    setCategoryForOperation: function(operationId, categoryId, cb) {
        var found = FindOperationById(operationId);
        found.categoryId = categoryId;
        setTimeout(cb, 0);
    }
};
