import { assert, translate as $t } from '../helpers';
import { hasForbiddenOrMissingField, hasForbiddenField } from '../../shared/validators';

class Request {
    url = null;
    method = null;
    contentType = null;
    bodyContent = null;
    extraOptions = null;

    constructor(url) {
        this.url = url;
    }
    put() {
        assert(this.method === null, 'method redefined');
        this.method = 'PUT';
        return this;
    }
    delete() {
        assert(this.method === null, 'method redefined');
        this.method = 'DELETE';
        return this;
    }
    post() {
        assert(this.method === null, 'method redefined');
        this.method = 'POST';
        return this;
    }
    json(object) {
        assert(this.contentType === null, 'content type redefined');
        assert(this.bodyContent === null, 'body redefined');
        this.contentType = 'application/json';
        this.bodyContent = JSON.stringify(object);
        return this;
    }
    text(textContent) {
        assert(this.contentType === null, 'content type redefined');
        assert(this.bodyContent === null, 'body redefined');
        this.contentType = 'text/plain';
        this.bodyContent = textContent;
        return this;
    }
    options(extraOptions) {
        assert(this.extraOptions === null, 'options redefined');
        this.extraOptions = extraOptions;
        return this;
    }

    async run() {
        let options = {
            // Send credentials in case the API is behind an HTTP auth.
            credentials: 'include',
            ...this.extraOptions,
        };

        if (this.method !== null) {
            options.method = this.method;
        }
        if (this.contentType !== null) {
            options.headers = {
                'Content-Type': this.contentType,
            };
        }
        if (this.bodyContent) {
            options.body = this.bodyContent;
        }

        let response;
        try {
            response = await fetch(this.url, options);
        } catch (e) {
            let message = e.message || '?';
            let shortMessage = message;
            if (message && message.includes('NetworkError')) {
                message = shortMessage = $t('client.general.network_error');
            }
            throw {
                code: null,
                message,
                shortMessage,
            };
        }

        let contentType = response.headers.get('Content-Type');
        let isJsonResponse = contentType && contentType.includes('json');

        // Do the JSON parsing ourselves. Otherwise, we cannot access the raw
        // text in case of a JSON decode error nor can we only decode if the
        // body is not empty.
        let body = await response.text();

        let bodyOrJson;
        if (!isJsonResponse) {
            bodyOrJson = body;
        } else if (!body) {
            bodyOrJson = {};
        } else {
            try {
                bodyOrJson = JSON.parse(body);
            } catch (e) {
                throw {
                    code: null,
                    message: e.message || '?',
                    shortMessage: $t('client.general.json_parse_error'),
                };
            }
        }

        // If the initial response status code wasn't in the 200 family, the
        // JSON describes an error.
        if (!response.ok) {
            throw {
                code: bodyOrJson.code,
                message: bodyOrJson.message || '?',
                shortMessage: bodyOrJson.shortMessage || bodyOrJson.message || '?',
            };
        }

        return bodyOrJson;
    }
}

// /api/all
export function init() {
    return new Request('api/all/').options({ cache: 'no-cache' }).run();
}
export function importInstance(data, maybePassword) {
    return new Request('api/all')
        .post()
        .json({
            data,
            encrypted: !!maybePassword,
            passphrase: maybePassword,
        })
        .run();
}
export function importOFX(data) {
    return new Request('api/all/import/ofx').post().text(data).run();
}
export function exportInstance(maybePassword) {
    return new Request('api/all/export')
        .post()
        .json({
            encrypted: !!maybePassword,
            passphrase: maybePassword,
        })
        .run();
}

// /api/accesses
export function createAccess(
    vendorId,
    login,
    password,
    customFields,
    customLabel,
    userActionFields = null
) {
    let data = {
        vendorId,
        login,
        password,
        customLabel,
        fields: customFields,
        // TODO would be nice to separate the access' fields from the user action fields.
        userActionFields,
    };
    return new Request('api/accesses').post().json(data).run();
}

export function updateAccess(accessId, update) {
    let error = hasForbiddenField(update, ['enabled', 'customLabel']);
    if (error) {
        window.alert(`Developer error when updating an access: ${error}`);
        return;
    }
    return new Request(`api/accesses/${accessId}`).put().json(update).run();
}

export function updateAndFetchAccess(accessId, access, userActionFields = null) {
    let error = hasForbiddenField(access, ['login', 'password', 'customFields']);
    if (error) {
        window.alert(`Developer error when updating an access: ${error}`);
        return;
    }
    // Transform the customFields update to the server's format.
    let { customFields, ...rest } = access;
    let data = { fields: customFields, ...rest, userActionFields };
    return new Request(`api/accesses/${accessId}/fetch/accounts`).put().json(data).run();
}

export function getNewAccounts(accessId, userActionFields = null) {
    let request = new Request(`api/accesses/${accessId}/fetch/accounts`).post();
    if (userActionFields !== null) {
        request = request.json({
            userActionFields,
        });
    }
    return request.run();
}
export function getNewOperations(accessId, userActionFields = null) {
    let request = new Request(`api/accesses/${accessId}/fetch/operations`).post();
    if (userActionFields !== null) {
        request = request.json({
            userActionFields,
        });
    }
    return request.run();
}
export function deleteAccess(accessId) {
    return new Request(`api/accesses/${accessId}`).delete().run();
}

// /api/accounts
export function updateAccount(accountId, newFields) {
    let error = hasForbiddenField(newFields, ['excludeFromBalance', 'customLabel']);
    if (error) {
        window.alert(`Developer error when updating an account: ${error}`);
        return;
    }
    return new Request(`api/accounts/${accountId}`).put().json(newFields).run();
}
export function deleteAccount(accountId) {
    return new Request(`api/accounts/${accountId}`).delete().run();
}
export async function resyncBalance(accountId, userActionFields = null) {
    let request = new Request(`api/accounts/${accountId}/resync-balance`).post();
    if (userActionFields !== null) {
        request = request.json({ userActionFields });
    }
    return request.run();
}

// /api/operations
export function createOperation(operation) {
    return new Request('api/operations').post().json(operation).run();
}
export function updateOperation(id, newOp) {
    return new Request(`api/operations/${id}`).put().json(newOp).run();
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
export function setOperationBudgetDate(operationId, budgetDate) {
    return updateOperation(operationId, { budgetDate });
}
export function deleteOperation(opId) {
    return new Request(`api/operations/${opId}`).delete().run();
}
export function mergeOperations(toKeepId, toRemoveId) {
    return new Request(`api/operations/${toKeepId}/mergeWith/${toRemoveId}`).put().run();
}

// /api/categories
export function addCategory(category) {
    let error = hasForbiddenOrMissingField(category, ['label', 'color']);
    if (error) {
        window.alert(`Developer error when adding a category: ${error}`);
        return;
    }
    return new Request('api/categories').post().json(category).run();
}
export function updateCategory(id, category) {
    let error = hasForbiddenField(category, ['label', 'color']);
    if (error) {
        window.alert(`Developer error when updating a category: ${error}`);
        return;
    }
    return new Request(`api/categories/${id}`).put().json(category).run();
}
export function deleteCategory(categoryId, replaceByCategoryId) {
    return new Request(`api/categories/${categoryId}`).delete().json({ replaceByCategoryId }).run();
}

// /api/budgets
export function fetchBudgets(year, month) {
    return new Request(`api/budgets/${year}/${month}`).run();
}
export function updateBudget(budget) {
    const { categoryId, year, month } = budget;
    return new Request(`api/budgets/${categoryId}/${year}/${month}`).put().json(budget).run();
}

// /api/alerts
export function createAlert(newAlert) {
    return new Request('api/alerts').post().json(newAlert).run();
}
export function updateAlert(alertId, attributes) {
    return new Request(`api/alerts/${alertId}`).put().json(attributes).run();
}
export function deleteAlert(alertId) {
    return new Request(`api/alerts/${alertId}`).delete().run();
}

// /api/settings
export function saveSetting(key, value) {
    return new Request('api/settings').post().json({ key, value }).run();
}

// /api/instance
export function sendTestEmail(email) {
    return new Request('api/instance/test-email').post().json({ email }).run();
}
export function sendTestNotification(appriseUrl) {
    return new Request('api/instance/test-notification').post().json({ appriseUrl }).run();
}
export function updateWeboob() {
    return new Request('api/instance/weboob/').put().run();
}
export function fetchWeboobVersion() {
    return new Request('api/instance/weboob').run();
}

// /api/logs & /api/demo
export function fetchLogs() {
    return new Request('api/logs').run();
}
export function clearLogs() {
    return new Request('api/logs').delete().run();
}
export function enableDemoMode() {
    return new Request('api/demo').post().run();
}
export function disableDemoMode() {
    return new Request('api/demo').delete().run();
}
