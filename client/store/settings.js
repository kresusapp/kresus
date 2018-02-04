import u from 'updeep';

import DefaultSettings from '../../shared/default-settings';

import { assert, setupTranslator, translate as $t } from '../helpers';

import * as backend from './backend';
import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL } from './helpers';

import {
    DISABLE_ACCESS,
    EXPORT_INSTANCE,
    SEND_TEST_EMAIL,
    SET_SETTING,
    UPDATE_ACCESS,
    UPDATE_WEBOOB,
    GET_WEBOOB_VERSION
} from './actions';

import Errors, { genericErrorHandler } from '../errors';

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

    fetchWeboobVersion(version = null, isInstalled = null) {
        return {
            type: GET_WEBOOB_VERSION,
            version,
            isInstalled
        };
    },

    disableAccess(accessId, newFields = {}) {
        return {
            type: DISABLE_ACCESS,
            accessId,
            newFields
        };
    },

    updateAccess(accessId, newFields = {}, results = null) {
        return {
            type: UPDATE_ACCESS,
            accessId,
            newFields,
            results
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
    return dispatch => {
        dispatch(basic.disableAccess(accessId));
        backend
            .updateAccess(accessId, newFields)
            .then(() => {
                dispatch(success.disableAccess(accessId, newFields));
            })
            .catch(err => {
                dispatch(fail.disableAccess(err));
            });
    };
}

export function sendTestEmail(email) {
    return dispatch => {
        dispatch(basic.sendTestEmail());
        backend
            .sendTestEmail(email)
            .then(() => {
                dispatch(success.sendTestEmail());
            })
            .catch(err => {
                dispatch(fail.sendTestEmail(err));
            });
    };
}

export function set(key, value) {
    assert(typeof key === 'string', 'key must be a string');
    assert(typeof value === 'string', 'value must be a string');
    assert(key.length + value.length, 'key and value must be non-empty');

    return dispatch => {
        dispatch(basic.set(key, value));
        backend
            .saveSetting(String(key), String(value))
            .then(() => {
                dispatch(success.set(key, value));
            })
            .catch(err => {
                dispatch(fail.set(err, key, value));
            });
    };
}

export function updateWeboob() {
    return dispatch => {
        dispatch(basic.updateWeboob());
        backend
            .updateWeboob()
            .then(() => {
                dispatch(success.updateWeboob());
            })
            .catch(err => {
                dispatch(fail.updateWeboob(err));
            });
    };
}

export function fetchWeboobVersion() {
    return dispatch => {
        backend
            .fetchWeboobVersion()
            .then(result => {
                let { version, isInstalled } = result.data;
                dispatch(success.fetchWeboobVersion(version, isInstalled));
            })
            .catch(err => {
                dispatch(fail.fetchWeboobVersion(err));
            });
    };
}

export function resetWeboobVersion() {
    return success.fetchWeboobVersion(null, null);
}

export function updateAccess(accessId, login, password, customFields) {
    let newFields = {
        login,
        customFields,
        enabled: true
    };
    return dispatch => {
        dispatch(basic.updateAccess(accessId, newFields));
        backend
            .updateAccess(accessId, { password, ...newFields })
            .then(results => {
                results.accessId = accessId;
                dispatch(success.updateAccess(accessId, newFields, results));
            })
            .catch(err => {
                dispatch(fail.updateAccess(err));
            });
    };
}

export function exportInstance(maybePassword) {
    return dispatch => {
        dispatch(basic.exportInstance());
        backend
            .exportInstance(maybePassword)
            .then(res => {
                dispatch(success.exportInstance(null, res));
            })
            .catch(err => {
                dispatch(fail.exportInstance(err));
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

        return u(
            {
                map: { [key]: value }
            },
            state
        );
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
        let url = URL.createObjectURL(blob);

        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        month = month < 10 ? `0${month}` : month;
        let day = date.getDate();
        day = day < 10 ? `0${day}` : day;

        let filename = `kresus-backup_${year}-${month}-${day}.${extension}`;

        // Create a fake link and simulate a click on it.
        let pom = document.createElement('a');
        pom.setAttribute('href', url);
        pom.setAttribute('download', filename);
        if (document.createEvent) {
            let event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        } else {
            pom.click();
        }
    }

    return state;
}

function reduceGetWeboobVersion(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let stateUpdates = {
            weboobVersion: action.version
        };

        if (typeof action.isInstalled === 'boolean') {
            if (!action.isInstalled) {
                window.alert($t('client.sync.weboob_not_installed'));
            }
            stateUpdates.map = { 'weboob-installed': action.isInstalled.toString() };
        }

        return u(stateUpdates, state);
    }

    if (status === FAIL) {
        if (action.error.code === Errors.WEBOOB_NOT_INSTALLED) {
            window.alert($t('client.sync.weboob_not_installed'));
            return u({ map: { 'weboob-installed': 'false' } }, state);
        }

        genericErrorHandler(action.error);
        return u({ weboobVersion: '?' }, state);
    }

    return state;
}

const reducers = {
    EXPORT_INSTANCE: reduceExportInstance,
    GET_WEBOOB_VERSION: reduceGetWeboobVersion,
    SET_SETTING: reduceSet
};

export const reducer = createReducerFromMap(settingsState, reducers);

// Initial state
export function initialState(settings) {
    let map = {};

    for (let pair of settings) {
        assert(
            DefaultSettings.has(pair.name),
            `all settings must have their default value, missing for: ${pair.name}`
        );
        map[pair.name] = pair.value;
    }

    assert(typeof map.locale !== 'undefined', 'Kresus needs a locale');

    setupTranslator(map.locale);

    return u(
        {
            weboobVersion: null,
            map
        },
        {}
    );
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

export function getWeboobVersion(state) {
    return state.weboobVersion;
}
