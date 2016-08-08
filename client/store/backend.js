// Creates a function taking the "reject" argument of a new Promise and that
// can handle jquery ajax errors.
function xhrReject(reject) {
    return (xhr, textStatus, xhrError) => {
        let xhrText = xhr.responseText;
        let error = {};

        try {
            error = JSON.parse(xhrText);
        } catch (e) {
            // ignore
        }

        reject({
            code: error.code,
            message: error.message || '?',
            xhrText,
            xhrError
        });
    };
}

export function init() {
    return new Promise((accept, reject) => {
        $.get('all/', accept)
         .fail(xhrReject(reject));
    });
}

export function getAccounts(accessId) {
    return new Promise((accept, reject) => {
        $.get(`accesses/${accessId}/accounts`, data => {
            accept(data);
        })
        .fail(xhrReject(reject));
    });
}

export function deleteAccess(accessId) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `accesses/${accessId}`,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function getOperations(accountId) {
    return new Promise((accept, reject) => {
        $.get(`accounts/${accountId}/operations`, accept)
        .fail(xhrReject(reject));
    });
}

export function deleteOperation(opId) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `operations/${opId}`,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function deleteAccount(accountId) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `accounts/${accountId}`,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function createAlert(newAlert) {
    return new Promise((accept, reject) => {
        $.post('alerts/', newAlert, data => {
            accept(data);
        })
         .fail(xhrReject(reject));
    });
}

export function updateAlert(alertId, attributes) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `alerts/${alertId}`,
            type: 'PUT',
            data: attributes,
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function deleteAlert(alertId) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `alerts/${alertId}`,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function deleteCategory(categoryId, replaceByCategoryId) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `categories/${categoryId}`,
            type: 'DELETE',
            data: { replaceByCategoryId },
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function updateOperation(id, newOp) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `operations/${id}`,
            type: 'PUT',
            data: newOp,
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function setCategoryForOperation(operationId, categoryId) {
    return this.updateOperation(operationId, { categoryId });
}

export function setTypeForOperation(operationId, type) {
    return this.updateOperation(operationId, { type });
}

export function setCustomLabel(operationId, customLabel) {
    return this.updateOperation(operationId, { customLabel });
}

export function mergeOperations(toKeepId, toRemoveId) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `operations/${toKeepId}/mergeWith/${toRemoveId}`,
            type: 'PUT',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function getNewOperations(accessId) {
    return new Promise((accept, reject) => {
        $.get(`accesses/${accessId}/fetch/operations`, accept)
         .fail(xhrReject(reject));
    });
}

export function createOperation(operation) {
    return new Promise((accept, reject) => {
        $.post('operations/', operation, accept)
         .fail(xhrReject(reject));
    });
}

export function getNewAccounts(accessId) {
    return new Promise((accept, reject) => {
        $.get(`accesses/${accessId}/fetch/accounts`, accept)
         .fail(xhrReject(reject));
    });
}

export function updateWeboob() {
    return new Promise((accept, reject) => {
        $.ajax({
            url: 'settings/weboob/',
            type: 'PUT',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function importInstance(content) {
    return new Promise((accept, reject) => {
        $.post('all/', { all: content }, accept)
         .fail(xhrReject(reject));
    });
}

export function saveSetting(key, value) {
    return new Promise((accept, reject) => {
        $.post('settings/', { key, value }, accept)
         .fail(xhrReject(reject));
    });
}

export function updateAccess(accessId, access) {
    return new Promise((accept, reject) => {
        if (access.customFields)
            access.customFields = JSON.stringify(access.customFields);
        $.ajax({
            url: `accesses/${accessId}`,
            type: 'PUT',
            data: access,
            success: accept,
            error: xhrReject(reject)
        });
    });
}

export function createAccess(bank, login, password, customFields) {
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
}

export function addCategory(category) {
    return new Promise((accept, reject) => {
        $.post('categories/', category, accept)
         .fail(xhrReject(reject));
    });
}

export function updateCategory(id, category) {
    return new Promise((accept, reject) => {
        $.ajax({
            url: `categories/${id}`,
            type: 'PUT',
            data: category,
            success: accept,
            error: xhrReject(reject)
        });
    });
}
