import {Account, Alert, Bank, Category, Operation, Setting} from './Models';

// Creates a function taking the "reject" argument of a new Promise and that
// can handle jquery ajax errors.
function xhrReject(reject) {
    return (xhr, textStatus, xhrError) => {
        let xhrText = xhr.responseText;
        let error = {};

        try {
            error = JSON.parse(xhrText);
        } catch(e) {
            // ignore
        }

        reject({
            code: error.code,
            message: error.message || '?',
            xhrText,
            xhrError,
        });
    };
}

module.exports = {
    init() {
        return new Promise((accept, reject) => {
            $.get('all', accept)
             .fail(xhrReject(reject));
        });
    },

    getAccounts(bankId) {
        return new Promise((accept, reject) => {
            $.get(`banks/${bankId}/accounts`, data => {
                let accounts = data.map(acc => new Account(acc));
                accept({ bankId, accounts });
            })
            .fail(xhrReject(reject));
        });
    },

    getOperations(accountId) {
        return new Promise((accept, reject) => {
            $.get(`accounts/${accountId}/operations`, data => {
                let operations = data.map(o => new Operation(o));
                accept(operations);
            })
            .fail(xhrReject(reject));
        });
    },

    deleteBank(bankId) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'banks/' + bankId,
                type: 'DELETE',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    deleteAccount(accountId) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'accounts/' + accountId,
                type: 'DELETE',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    createAlert(newAlert) {
        return new Promise((accept, reject) => {
            $.post('alerts/', newAlert, data => {
                accept(new Alert(data));
            })
             .fail(xhrReject(reject));
        });
    },

    updateAlert(alertId, attributes) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'alerts/' + alertId,
                type: 'PUT',
                data: attributes,
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    deleteAlert(alertId) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'alerts/' + alertId,
                type: 'DELETE',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    deleteCategory(categoryId, replaceByCategoryId) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'categories/' + categoryId,
                type: 'DELETE',
                data: { replaceByCategoryId },
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    updateOperation(id, newOp) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'operations/' + id,
                type: 'PUT',
                data: newOp,
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    setCategoryForOperation(operationId, categoryId) {
        return this.updateOperation(operationId, {categoryId});
    },

    setTypeForOperation(operationId, operationTypeID) {
        return this.updateOperation(operationId, {operationTypeID});
    },

    setCustomLabel(operationId, customLabel) {
        return this.updateOperation(operationId, {customLabel});
    },

    mergeOperations(toKeepId, toRemoveId) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'operations/' + toKeepId + '/mergeWith/' + toRemoveId,
                type: 'PUT',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    getNewOperations(accessId) {
        return new Promise((accept, reject) => {
            $.get('accesses/' + accessId + '/fetch/operations', accept)
             .fail(xhrReject(reject));
        })
    },

    getNewAccounts(accessId) {
        return new Promise((accept, reject) => {
            $.get('accesses/' + accessId + '/fetch/accounts', accept)
             .fail(xhrReject(reject));
        })
    },

    updateWeboob(which) {
        return new Promise((accept, reject) => {
            $.ajax({
                url: 'settings/weboob',
                type: 'PUT',
                data: { action: which },
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    importInstance(content) {
        return new Promise((accept, reject) => {
            $.post('all/', {all: content}, accept)
             .fail(xhrReject(reject));
        });
    },

    saveSetting(key, value) {
        return new Promise((accept, reject) => {
            $.post('settings', { key, value }, accept)
             .fail(xhrReject(reject));
        });
    },

    updateAccess(accessId, access) {
        return new Promise((accept, reject) => {
            access.customFields = access.customFields ? JSON.stringify(access.customFields) : undefined;
            $.ajax({
                url: 'accesses/' + accessId,
                type: 'PUT',
                data: access,
                success: accept,
                error: xhrReject(reject)
            });
        });
    },

    addBank(bank, login, password, customFields) {
        return new Promise((accept, reject) => {
            let data = {
                bank,
                login,
                password,
                customFields
            };

            if (data.customFields)
                data.customFields = JSON.stringify(data.customFields);

            $.post('accesses/', data, accept)
             .fail(xhrReject(reject));
        });
    },

    addCategory(category) {
        return new Promise((accept, reject) => {
            $.post('categories', category, accept)
             .fail(xhrReject(reject));
        });
    },

    updateCategory(id, category) {
        return new Promise((accept, reject) => {
            $.ajax({
                url:'categories/' + id,
                type: 'PUT',
                data: category,
                success: accept,
                error: xhrReject(reject)
            });
        })
    },
};
