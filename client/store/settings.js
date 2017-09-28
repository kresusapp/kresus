import u from 'updeep';

import DefaultSettings from '../../shared/default-settings';

import { assert, setupTranslator } from '../helpers';

import * as backend from './backend';
import { createReducerFromMap, fillOutcomeHandlers, SUCCESS } from './helpers';

import {
    EXPORT_INSTANCE,
    SEND_TEST_EMAIL,
    SET_SETTING,
    UPDATE_ACCESS,
    UPDATE_WEBOOB
} from './actions';

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

    updateAccess(results = {}) {
        return {
            type: UPDATE_ACCESS,
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

export function sendTestEmail(config) {
    return dispatch => {
        dispatch(basic.sendTestEmail());
        backend
            .sendTestEmail(config)
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

export function updateAccess(accessId, login, password, customFields) {
    return dispatch => {
        dispatch(basic.updateAccess());
        backend
            .updateAccess(accessId, { login, password, customFields })
            .then(results => {
                results.accessId = accessId;
                dispatch(success.updateAccess(results));
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
        if (typeof content === 'object') {
            blob = new Blob([JSON.stringify(content)], { type: 'application/vnd+json' });
        } else {
            assert(typeof content === 'string');
            blob = new Blob([content], { type: 'application/vnd+txt' });
        }
        let url = URL.createObjectURL(blob);

        window.open(url);
    }

    return state;
}

function reduceDeleteAccount(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { accountId } = action;
        if (accountId === get(state, 'defaultAccountId')) {
            let defaultAccountId = DefaultSettings.get('defaultAccountId');
            return u({ map: { defaultAccountId } }, state);
        }
    }

    return state;
}

function reduceDeleteAccess(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let { accountsIds } = action;
        if (accountsIds.includes(get(state, 'defaultAccountId'))) {
            let defaultAccountId = DefaultSettings.get('defaultAccountId');
            return u({ map: { defaultAccountId } }, state);
        }
    }

    return state;
}

const reducers = {
    EXPORT_INSTANCE: reduceExportInstance,
    SET_SETTING: reduceSet,
    DELETE_ACCOUNT: reduceDeleteAccount,
    DELETE_ACCESS: reduceDeleteAccess
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
            map
        },
        {}
    );
}

// Getters
export function get(state, key) {
    if (typeof state.map[key] !== 'undefined') return state.map[key];

    return getDefaultSetting(state, key);
}

export function getDefaultSetting(state, key) {
    assert(
        DefaultSettings.has(key),
        `all settings must have default values, but ${key} doesn't have one.`
    );
    return DefaultSettings.get(key);
}
