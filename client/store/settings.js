import u from 'updeep';

import DefaultSettings from '../../shared/default-settings';

import { assert, setupTranslator, UNKNOWN_WEBOOB_VERSION } from '../helpers';

import * as backend from './backend';
import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL } from './helpers';

import {
    EXPORT_INSTANCE,
    SEND_TEST_EMAIL,
    SEND_TEST_NOTIFICATION,
    SET_SETTING,
    UPDATE_ACCESS,
    UPDATE_ACCESS_AND_FETCH,
    UPDATE_WEBOOB,
    GET_WEBOOB_VERSION,
    FETCH_LOGS,
    CLEAR_LOGS
} from './actions';

import Errors, { genericErrorHandler } from '../errors';

/* Those settings are stored in the browser local storage only. */
const localSettings = ['dark-mode'];

function getLocalSettings() {
    if (window && window.localStorage) {
        // Filter settings without local values (getItem will return null if there is no stored
        // value for a given key).
        return localSettings
            .map(s => ({
                key: s,
                value: window.localStorage.getItem(s)
            }))
            .filter(pair => pair.value !== null);
    }
    return [];
}

const settingsState = u({
    // A map of key to values.
    map: {}
});

// Basic action creators
const basic = {
    sendTestEmail() {
        return {
            type: SEND_TEST_EMAIL
        };
    },

    sendTestNotification() {
        return {
            type: SEND_TEST_NOTIFICATION
        };
    },

    set(key, value) {
        return {
            type: SET_SETTING,
            key,
            value
        };
    },

    updateWeboob() {
        return {
            type: UPDATE_WEBOOB
        };
    },

    fetchWeboobVersion(version = UNKNOWN_WEBOOB_VERSION, isInstalled = null) {
        return {
            type: GET_WEBOOB_VERSION,
            version,
            isInstalled
        };
    },

    fetchLogs(logs = null) {
        return {
            type: FETCH_LOGS,
            logs
        };
    },

    clearLogs() {
        return {
            type: CLEAR_LOGS
        };
    },

    updateAndFetchAccess(accessId, newFields = {}, results = null) {
        return {
            type: UPDATE_ACCESS_AND_FETCH,
            accessId,
            newFields,
            results
        };
    },

    updateAccess(accessId, newFields) {
        return {
            type: UPDATE_ACCESS,
            accessId,
            newFields
        };
    },

    exportInstance(password, content = null) {
        return {
            type: EXPORT_INSTANCE,
            password,
            content
        };
    }
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

export function disableAccess(accessId) {
    let newFields = {
        enabled: false
    };
    let oldFields = {
        enabled: true
    };
    return dispatch => {
        dispatch(basic.updateAccess(accessId, newFields, oldFields));
        return backend
            .updateAccess(accessId, newFields)
            .then(() => {
                dispatch(success.updateAccess(accessId, newFields));
            })
            .catch(err => {
                dispatch(fail.updateAccess(err, accessId, oldFields));
                throw err;
            });
    };
}

export function sendTestEmail(email) {
    return dispatch => {
        dispatch(basic.sendTestEmail());
        return backend
            .sendTestEmail(email)
            .then(() => {
                dispatch(success.sendTestEmail());
            })
            .catch(err => {
                dispatch(fail.sendTestEmail(err));
                throw err;
            });
    };
}

export function sendTestNotification(appriseUrl) {
    return dispatch => {
        dispatch(basic.sendTestNotification());
        return backend
            .sendTestNotification(appriseUrl)
            .then(() => {
                dispatch(success.sendTestNotification());
            })
            .catch(err => {
                dispatch(fail.sendTestNotification(err));
                throw err;
            });
    };
}

export function set(key, value) {
    assert(typeof key === 'string', 'key must be a string');
    assert(typeof value === 'string', 'value must be a string');
    assert(key.length + value.length, 'key and value must be non-empty');

    return dispatch => {
        dispatch(basic.set(key, value));

        if (localSettings.includes(key)) {
            try {
                window.localStorage.setItem(key, value);
                dispatch(success.set(key, value));
                return;
            } catch (err) {
                dispatch(fail.set(err, key, value));
                throw err;
            }
        }

        return backend
            .saveSetting(String(key), String(value))
            .then(() => {
                dispatch(success.set(key, value));
            })
            .catch(err => {
                dispatch(fail.set(err, key, value));
                throw err;
            });
    };
}

export function updateWeboob() {
    return dispatch => {
        dispatch(basic.updateWeboob());
        return backend
            .updateWeboob()
            .then(() => {
                dispatch(success.updateWeboob());
            })
            .catch(err => {
                dispatch(fail.updateWeboob(err));
                throw err;
            });
    };
}

export function fetchWeboobVersion() {
    return dispatch => {
        return backend
            .fetchWeboobVersion()
            .then(result => {
                let { version, isInstalled } = result.data;
                dispatch(success.fetchWeboobVersion(version, isInstalled));

                // Throw an error when weboob is installed but out of date.
                if (!isInstalled) {
                    return Promise.reject({ code: Errors.WEBOOB_NOT_INSTALLED });
                }
            })
            .catch(err => {
                dispatch(fail.fetchWeboobVersion(err));
                throw err;
            });
    };
}

export function resetWeboobVersion() {
    return success.fetchWeboobVersion(UNKNOWN_WEBOOB_VERSION, null);
}

export function updateAndFetchAccess(accessId, login, password, customFields) {
    let newFields = {
        login,
        customFields
    };
    return dispatch => {
        dispatch(basic.updateAndFetchAccess(accessId, newFields));
        return backend
            .updateAndFetchAccess(accessId, { password, ...newFields })
            .then(results => {
                results.accessId = accessId;
                dispatch(
                    success.updateAndFetchAccess(accessId, { enabled: true, ...newFields }, results)
                );
            })
            .catch(err => {
                dispatch(fail.updateAndFetchAccess(err, accessId));
                throw err;
            });
    };
}

export function updateAccess(accessId, update, old) {
    return dispatch => {
        dispatch(basic.updateAccess(accessId, update));
        return backend
            .updateAccess(accessId, update)
            .then(() => {
                dispatch(success.updateAccess(accessId, update));
            })
            .catch(err => {
                dispatch(fail.updateAccess(err, accessId, old));
                throw err;
            });
    };
}

export function exportInstance(maybePassword) {
    return dispatch => {
        dispatch(basic.exportInstance());
        return backend
            .exportInstance(maybePassword)
            .then(res => {
                dispatch(success.exportInstance(null, res));
            })
            .catch(err => {
                dispatch(fail.exportInstance(err));
                throw err;
            });
    };
}

export function fetchLogs() {
    return dispatch => {
        dispatch(basic.fetchLogs());
        backend
            .fetchLogs()
            .then(result => {
                dispatch(success.fetchLogs(result));
            })
            .catch(err => {
                dispatch(fail.fetchLogs(err));
            });
    };
}

export function resetLogs() {
    return success.fetchLogs(null);
}

export function clearLogs() {
    return dispatch => {
        backend
            .clearLogs()
            .then(result => {
                dispatch(success.clearLogs(result));
            })
            .catch(err => {
                dispatch(fail.clearLogs(err));
            });
    };
}

// Reducers
function reduceSet(state, action) {
    let { status, key, value } = action;

    if (status === SUCCESS) {
        if (key === 'locale') {
            setupTranslator(value);
        }

        return u({ map: { [key]: value } }, state);
    }

    return state;
}

function reduceExportInstance(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { content } = action;

        let blob;
        let extension;
        if (typeof content === 'object') {
            blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
            extension = 'json';
        } else {
            assert(typeof content === 'string');
            blob = new Blob([content], { type: 'txt' });
            extension = 'txt';
        }
        const url = URL.createObjectURL(blob);

        // Get the current date without time, as a string. Ex: "2020-04-11".
        const date = new Date().toISOString().substr(0, 10);
        const filename = `kresus-backup_${date}.${extension}`;

        try {
            // Create a fake link and simulate a click on it.
            const anchor = document.createElement('a');
            anchor.setAttribute('href', url);
            anchor.setAttribute('download', filename);

            const event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            anchor.dispatchEvent(event);
        } catch (e) {
            // Revert to a less friendly method if the previous doesn't work.
            window.open(url, '_blank');
        }
    }

    return state;
}

function reduceGetWeboobVersion(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let stateUpdates = { map: { 'weboob-version': action.version } };

        if (typeof action.isInstalled === 'boolean') {
            stateUpdates.map['weboob-installed'] = action.isInstalled.toString();
        }

        return u(stateUpdates, state);
    }

    if (status === FAIL) {
        if (action.error.code === Errors.WEBOOB_NOT_INSTALLED) {
            return u({ map: { 'weboob-installed': 'false' } }, state);
        }

        genericErrorHandler(action.error);
        return u({ map: { 'weboob-version': null } }, state);
    }

    return state;
}

function reduceFetchLogs(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ isLoadingLogs: false, logs: action.logs }, state);
    }

    if (status === FAIL) {
        genericErrorHandler(action.error);
        return u({ isLoadingLogs: false, logs: null }, state);
    }

    return u({ isLoadingLogs: true }, state);
}

function reduceClearLogs(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ logs: null }, state);
    }

    if (status === FAIL) {
        genericErrorHandler(action.error);
        return state;
    }

    return state;
}

const reducers = {
    EXPORT_INSTANCE: reduceExportInstance,
    GET_WEBOOB_VERSION: reduceGetWeboobVersion,
    FETCH_LOGS: reduceFetchLogs,
    CLEAR_LOGS: reduceClearLogs,
    SET_SETTING: reduceSet
};

export const reducer = createReducerFromMap(settingsState, reducers);

// Initial state
export function initialState(settings) {
    let map = {};

    let allSettings = settings.concat(getLocalSettings());
    for (let pair of allSettings) {
        assert(
            DefaultSettings.has(pair.key),
            `all settings must have their default value, missing for: ${pair.key}`
        );
        map[pair.key] = pair.value;
    }

    assert(typeof map.locale !== 'undefined', 'Kresus needs a locale');

    setupTranslator(map.locale);

    return u({ isLoadingLogs: false, logs: null, map }, {});
}

// Getters
export function get(state, key) {
    if (typeof state.map[key] !== 'undefined') {
        return state.map[key];
    }

    return getDefaultSetting(state, key);
}

export function getDefaultSetting(state, key) {
    assert(
        DefaultSettings.has(key),
        `all settings must have default values, but ${key} doesn't have one.`
    );
    return DefaultSettings.get(key);
}

export function getLogs(state) {
    return state.logs;
}
export function isLoadingLogs(state) {
    return state.isLoadingLogs;
}

export function getWeboobVersion(state) {
    return get(state, 'weboob-version');
}
