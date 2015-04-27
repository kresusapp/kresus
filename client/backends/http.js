import {Account, Bank, Category, Operation, Setting} from '../Models';

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

module.exports = {
    init() {
        return new Promise((ok, err) => {
            $.get('start', ok).fail(xhrReject(err));
        });
    },

    getAccounts: function(bankId, cb) {
        $.get(`banks/${bankId}/accounts`, function(accounts) {
            cb(bankId, accounts.map((acc) => new Account(acc)));
        }).fail(xhrError);
    },

    getOperations: function(accountId, cb) {
        $.get(`accounts/${accountId}/operations`, function (data) {
            cb(data.map((o) => new Operation(o)));
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

    getNewOperations: function(accessId, cb) {
        $.get('accesses/' + accessId + '/fetch/operations', cb).fail(xhrError);
    },

    getNewAccounts: function(accessId, cb) {
        $.get('accesses/' + accessId + '/fetch/accounts', cb).fail(xhrError);
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
