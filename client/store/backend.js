const API_VERSION = 'v1';

/**
 * Build a promise to fetch data from the API, with minor post-processing.
 * Takes the same parameters as the fetch API.
 */
function buildFetchPromise(url, options = {}) {
    return fetch(url, options)
        .then(response => {
            // First, check status code, and reject is error occurred
            if (!response.ok) {
                return Promise.reject({
                    code: response.status,
                    message: response.statusText,
                    shortMessage: ''
                });
            }
            return response;
        })
        .then(response => response.text())
        .then(response => {
            // Do the JSON parsing ourselves. Otherwise, we cannot access the
            // raw text in case of a JSON decode error nor can we only decode
            // if the response is not empty.
            try {
                if (response) {
                    return JSON.parse(response);
                }
            } catch (e) {
                return Promise.reject({
                    code: null,
                    message: e.message,
                    shortMessage: e.name
                });
            }
            return {};
        })
        .then(response => {
            // Handle errors in the JSON payload
            if (response.error) {
                return Promise.reject({
                    code: response.error.code,
                    message: response.error.message || '?',
                    shortMessage: response.error.shortMessage || '?'
                });
            }
            return response;
        });
}

export function init() {
    return buildFetchPromise(`api/${API_VERSION}/all/`);
}

export function getAccounts(accessId) {
    return buildFetchPromise(`api/${API_VERSION}/accesses/${accessId}/accounts`);
}

export function deleteAccess(accessId) {
    return buildFetchPromise(`api/${API_VERSION}/accesses/${accessId}`, {
        method: 'DELETE'
    });
}

export function getOperations(accountId) {
    return buildFetchPromise(`api/${API_VERSION}/accounts/${accountId}/operations`);
}

export function deleteOperation(opId) {
    return buildFetchPromise(`api/${API_VERSION}/operations/${opId}`, {
        method: 'DELETE'
    });
}

export function resyncBalance(accountId) {
    return buildFetchPromise(`api/${API_VERSION}/accounts/${accountId}/resync-balance`)
        .then(data => data.initialAmount);
}

export function deleteAccount(accountId) {
    return buildFetchPromise(`api/${API_VERSION}/accounts/${accountId}`, {
        method: 'DELETE'
    });
}

export function createAlert(newAlert) {
    return buildFetchPromise(`api/${API_VERSION}/alerts/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAlert)
    });
}

export function updateAlert(alertId, attributes) {
    return buildFetchPromise(`api/${API_VERSION}/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(attributes)
    });
}

export function deleteAlert(alertId) {
    return buildFetchPromise(`api/${API_VERSION}/alerts/${alertId}`, {
        method: 'DELETE'
    });
}

export function deleteCategory(categoryId, replaceByCategoryId) {
    return buildFetchPromise(`api/${API_VERSION}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replaceByCategoryId })
    });
}

export function updateOperation(id, newOp) {
    return buildFetchPromise(`api/${API_VERSION}/operations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newOp)
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
    return buildFetchPromise(`api/${API_VERSION}/operations/${toKeepId}/mergeWith/${toRemoveId}`, {
        method: 'PUT'
    });
}

export function getNewOperations(accessId) {
    return buildFetchPromise(`api/${API_VERSION}/accesses/${accessId}/fetch/operations`);
}

export function createOperation(operation) {
    return buildFetchPromise(`api/${API_VERSION}/operations/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(operation)
    });
}

export function getNewAccounts(accessId) {
    return buildFetchPromise(`api/${API_VERSION}/accesses/${accessId}/fetch/accounts`);
}

export function updateWeboob() {
    return buildFetchPromise(`api/${API_VERSION}/settings/weboob/`, {
        method: 'PUT'
    });
}

export function importInstance(content) {
    return buildFetchPromise(`api/${API_VERSION}/all/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ all: content })
    });
}

export function exportInstance(maybePassword) {
    return buildFetchPromise(`api/${API_VERSION}/all/export`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            encrypted: !!maybePassword,
            passphrase: maybePassword
        })
    });
}

export function saveSetting(key, value) {
    return buildFetchPromise(`api/${API_VERSION}/settings/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value })
    });
}

export function sendTestEmail(config) {
    return buildFetchPromise(`api/${API_VERSION}/settings/test-email/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
    });
}

export function updateAccess(accessId, access) {
    if (access.customFields) {
        access.customFields = JSON.stringify(access.customFields);
    }

    return buildFetchPromise(`api/${API_VERSION}/accesses/${accessId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(access)
    });
}

export function createAccess(bank, login, password, customFields) {
    let data = {
        bank,
        login,
        password,
        customFields
    };

    if (data.customFields) {
        data.customFields = JSON.stringify(data.customFields);
    }

    return buildFetchPromise(`api/${API_VERSION}/accesses/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

export function addCategory(category) {
    return buildFetchPromise(`api/${API_VERSION}/categories/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
    });
}

export function updateCategory(id, category) {
    return buildFetchPromise(`api/${API_VERSION}/categories/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
    });
}
