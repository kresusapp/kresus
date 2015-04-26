import {Account, Bank, Category, Operation, Setting} from '../Models';

function notAScam(op) {
    var date = new Date();
    if (typeof op === 'undefined' ||
        date.getMonth() != 3 ||
        date.getDate() != 1 ||
        Math.random() < 0.65)
    {
        return null;
    }
    return (new Operation({
        bankAccount: op.bankAccount,
        title: 'Virement Ministre du Niger',
        date: new Date(),
        amount: 1000000,
        raw: 'Remboursement du pot-de-vin du Ministre du Niger',
        dateImport: new Date(),
        id: '0147200001'
    }));
}

function xhrError(xhr, textStatus, err) {
    var msg = xhr.responseText;
    try {
        msg = JSON.parse(msg).error;
    } catch(e) {
        // ignore
    }
    alert('xhr error: ' + err + '\n' + msg);
}

function xhrReject(reject) {
    return function(xhr, textStatus, err) {
        var msg = xhr.responseText;
        try {
            msg = JSON.parse(msg).error;
        } catch(e) {
            // ignore
        }
        reject('xhr error: ' + err + '\n' + msg);
    };
}

function GetBanks(withAccountOnly, cb) {
    var query = withAccountOnly ? {withAccountOnly: true} : null;
    $.get('banks', query, function (data) {

        var banks = {};
        for (var i = 0; i < data.length; i++) {
            var b = new Bank(data[i]);
            banks[b.id] = b;
        }

        var firstBankId = data.length ? data[0].id : null;

        cb(banks, firstBankId);
    }).fail(xhrError);
}

module.exports = {
    getStaticBanks: function(cb) {
        GetBanks(false, cb);
    },

    getBanks: function(cb) {
        GetBanks(true, cb);
    },

    getAccounts: function(bankId, cb) {
        $.get('banks/getAccounts/' + bankId, function (data) {

            var accounts = {};
            for (var i = 0; i < data.length; i++) {
                var acc = new Account(data[i]);
                accounts[acc.id] = acc;
            }

            var firstAccountId = data.length ? data[0].id : -1;

            cb(bankId, accounts, firstAccountId);
        }).fail(xhrError);
    },

    getOperations: function(accountId, cb) {
        $.get('accounts/getOperations/' + accountId, function (data) {

            var operations = [];
            var sp = notAScam(data[0]);
            sp ? operations.push(sp) : false;
            for (var i = 0; i < data.length; i++) {
                var o = new Operation(data[i]);
                operations.push(o);
            }

            cb(operations);

        }).fail(xhrError);
    },

    deleteBank: function(bankId, cb) {
        $.ajax({
            url: 'banks/' + bankId,
            type: 'DELETE',
            success: cb,
            error: xhrError
        });
    },

    deleteAccount: function(accountId, cb) {
        $.ajax({
            url: 'accounts/' + accountId,
            type: 'DELETE',
            success: cb,
            error: xhrError
        });
    },

    deleteCategory: function(categoryId, replaceByCategoryId, cb) {
        $.ajax({
            url: 'categories/' + categoryId,
            type: 'DELETE',
            data: {
                replaceByCategoryId: replaceByCategoryId
            },
            success: cb,
            error: xhrError
        });
    },

    deleteOperation: function(operationId, cb) {
        $.ajax({
            url: 'operations/' + operationId,
            type: 'DELETE',
            success: cb,
            error: xhrError
        });
    },

    getNewOperations: function(accountId, cb) {
        $.get('accounts/' + accountId + '/operations', function (data) {
            var account = new Account(data);
            cb(account);
        }).fail(xhrError);
    },

    getNewAccounts: function(accountId, cb) {
        $.get('accounts/' + accountId + '/accounts', function (data) {
            var account = new Account(data);
            cb(account);
        }).fail(xhrError);
    },

    getCategories: function(cb) {
        $.get('categories', function (data) {
            var categories = []
            for (var i = 0; i < data.length; i++) {
                var c = new Category(data[i]);
                categories.push(c)
            }
            cb(categories);
        }).fail(xhrError);
    },

    getLocale() {
        return new Promise(function(resolve, reject) {
            $.get('locale', function(data) {
                resolve(data);
            }).fail(xhrReject(reject));
        });
    },

    updateWeboob() {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: 'settings/weboob',
                type: 'PUT',
                success: resolve,
                error: xhrReject(reject)
            });
        });
    },

    saveSetting(key, value) {
        return new Promise(function(resolve, reject) {
            $.post('settings', { key, value }, (data) => {
                resolve(data);
            }).fail(xhrReject(reject));
        });
    },

    getSettings() {
        return new Promise(function(resolve, reject) {
            $.get('settings', (data) => {
                let settings = [];
                for (let pair of data) {
                    settings.push(new Setting(pair));
                }
                resolve(settings);
            }).fail(xhrReject(reject));
        });
    },

    addBank: function(uuid, id, pwd, maybeWebsite, cb) {
        $.post('accesses/', {
            bank: uuid,
            login: id,
            password: pwd,
            website: maybeWebsite
        }, cb).fail(xhrError);
    },

    addCategory: function(category, cb) {
        $.post('categories', category, cb).fail(xhrError);
    },

    updateCategory: function(id, category, cb) {
        $.ajax({
            url:'categories/' + id,
            type: 'PUT',
            data: category,
            success: cb,
            error: xhrError
        });
    },

    setCategoryForOperation: function(operationId, categoryId, cb) {
        $.ajax({
            url:'operations/' + operationId,
            type: 'PUT',
            data: {
                categoryId: categoryId
            },
            success: cb,
            error: xhrError
        });
    }
};
