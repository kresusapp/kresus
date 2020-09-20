import u from 'updeep';

import DefaultSettings from '../../shared/default-settings';

import { assert, setupTranslator } from '../helpers';
import { DARK_MODE, LOCALE } from '../../shared/settings';

import * as backend from './backend';
import { createReducerFromMap, fillOutcomeHandlers, SUCCESS } from './helpers';

import { SET_SETTING, UPDATE_ACCESS, UPDATE_ACCESS_AND_FETCH } from './actions';

/* Those settings are stored in the browser local storage only. */
const localSettings = [DARK_MODE];

const browserSettingsGuesser = {
    [DARK_MODE]: () => {
        if (window && 'matchMedia' in window) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches.toString();
        }

        return null;
    },
};

function getLocalSettings() {
    if (window && window.localStorage) {
        // Filter settings without local values (getItem will return null if there is no stored
        // value for a given key).
        return localSettings
            .map(s => {
                let value = window.localStorage.getItem(s);

                // If there is no user-defined value for this setting, try to compute one from
                // the browser preferences.
                if (value === null && browserSettingsGuesser.hasOwnProperty(s)) {
                    value = browserSettingsGuesser[s]();
                }

                return {
                    key: s,
                    value,
                };
            })
            .filter(pair => pair.value !== null);
    }
    return [];
}

const settingsState = u({
    // A map of key to values.
    map: {},
});

// Basic action creators
const basic = {
    set(key, value) {
        return {
            type: SET_SETTING,
            key,
            value,
        };
    },

    updateAndFetchAccess(accessId, newFields = {}, results = null) {
        return {
            type: UPDATE_ACCESS_AND_FETCH,
            accessId,
            newFields,
            results,
        };
    },

    updateAccess(accessId, newFields) {
        return {
            type: UPDATE_ACCESS,
            accessId,
            newFields,
        };
    },
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

export function disableAccess(accessId) {
    let newFields = {
        enabled: false,
    };
    let oldFields = {
        enabled: true,
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

export function updateAndFetchAccess(accessId, login, password, customFields) {
    let newFields = {
        login,
        customFields,
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

// Reducers
function reduceSet(state, action) {
    let { status, key, value } = action;

    if (status === SUCCESS) {
        if (key === LOCALE) {
            setupTranslator(value);
        }

        return u({ map: { [key]: value } }, state);
    }

    return state;
}

const reducers = {
    SET_SETTING: reduceSet,
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

    return { map };
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
