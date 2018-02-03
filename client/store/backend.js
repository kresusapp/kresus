import { assert, translate as $t } from '../helpers';

const API_VERSION = 'v1';

let API_BASE = '';
if (process.env.NODE_ENV === 'development') {
    // In development mode, force the API port to be 9876, to be compatible
    // with webpack-dev-server.
    let { origin } = new URL(window.location);

    let split = origin.match(/(https?:\/\/)(.*)/);
    let scheme = split[1];
    let baseURL = split[2];

    // Remove port if needed.
    if (baseURL.includes(':')) {
        baseURL = baseURL.split(':')[0];
    }

    // Force port to 9876.
    API_BASE = `${scheme + baseURL}:9876/`;
}

/**
 * Build a promise to fetch data from the API, with minor post-processing.
 * Takes the same parameters as the fetch API.
 *
 * @param {string} url      The URL of the endpoint.
 * @param {object} options  An object containing options.
 * @return {Promise} A Fetch Promise.
 */
function buildFetchPromise(url, options = {}) {
    if (!options.credentials) {
        // Send credentials in case the API is behind an HTTP auth
        options.credentials = 'include';
    }
    let isOk = null;
    return fetch(API_BASE + url, options)
        .then(
            response => {
                isOk = response.ok;
                return response;
            },
            e => {
                let message = e.message;
                let shortMessage = message;
                if (message && message.includes('NetworkError')) {
                    message = shortMessage = $t('client.general.network_error');
                }
                return Promise.reject({
                    code: null,
                    message,
                    shortMessage
                });
            }
        )
        .then(response => response.text())
        .then(body => {
            // Do the JSON parsing ourselves. Otherwise, we cannot access the
            // raw text in case of a JSON decode error nor can we only decode
            // if the body is not empty.
            try {
                if (body) {
                    return JSON.parse(body);
                }
                return {};
            } catch (e) {
                return Promise.reject({
                    code: null,
                    message: e.message,
                    shortMessage: $t('client.general.json_parse_error')
                });
            }
        })
        .then(json => {
            // If the initial response status code wasn't in the 200 family,
            // the JSON describes an error.
            if (!isOk) {
                return Promise.reject({
                    code: json.code,
                    message: json.message || '?',
                    shortMessage: json.shortMessage || '?'
                });
            }
            return json;
        });
}

export function init() {
    return buildFetchPromise(`api/${API_VERSION}/all/`).then(world => {
        for (let i = 0; i < world.accesses.length; i++) {
            world.accesses[i].customFields = JSON.parse(world.accesses[i].customFields || '[]');
        }
        return world;
    });
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
    return buildFetchPromise(`api/${API_VERSION}/accounts/${accountId}/resync-balance`).then(
        data => data.initialAmount
    );
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
    return updateOperation(operationId, { categoryId });
}

export function setTypeForOperation(operationId, type) {
    return updateOperation(operationId, { type });
}

export function setCustomLabel(operationId, customLabel) {
    return updateOperation(operationId, { customLabel });
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

export function fetchWeboobVersion() {
    return buildFetchPromise(`api/${API_VERSION}/settings/weboob`);
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

export function sendTestEmail(email) {
    return buildFetchPromise(`api/${API_VERSION}/settings/test-email/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
}

export function updateAccess(accessId, access) {
    if (access.customFields) {
        assert(access.customFields instanceof Array);
        // Note this is correct even if the array is empty.
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
        password
    };

    if (customFields && customFields.length) {
        assert(customFields instanceof Array);
        data.customFields = JSON.stringify(customFields);
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
