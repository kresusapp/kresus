import u from 'updeep';

import DefaultSettings from '../../shared/default-settings';

import {
    assert,
    debug,
    setupTranslator,
    translate as $t
} from '../helpers';

import * as backend from './backend';
import { createReducerFromMap,
         fillOutcomeHandlers,
         SUCCESS, FAIL } from './helpers';

import {
    IMPORT_INSTANCE,
    NEW_STATE,
    SET_SETTING,
    UPDATE_WEBOOB,
    UPDATE_ACCESS
} from './actions';

const settingsState = u({
    // A map of key to values.
    map: {}
});

// Basic action creators
const basic = {

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

    updateAccess() {
        return {
            type: UPDATE_ACCESS
        };
    },

    importInstance(content) {
        return {
            type: IMPORT_INSTANCE,
            content
        };
    },

    newState(state) {
        return {
            type: NEW_STATE,
            state
        };
    }

};

const fail = {}, success = {};
fillOutcomeHandlers(basic, fail, success);

export function set(key, value) {
    assert(typeof key === 'string', 'key must be a string');
    assert(typeof value === 'string', 'value must be a string');
    assert(key.length + value.length, 'key and value must be non-empty');

    return dispatch => {
        dispatch(basic.set(key, value));
        backend.saveSetting(String(key), String(value))
        .then(() => {
            dispatch(success.set(key, value));
        }).catch(err => {
            dispatch(fail.set(err, key, value));
        });
    };
}

export function updateWeboob() {
    return dispatch => {
        dispatch(basic.updateWeboob());
        backend.updateWeboob().then(() => {
            dispatch(success.updateWeboob());
        }).catch(err => {
            dispatch(fail.updateWeboob(err));
        });
    };
}

export function updateAccess(accessId, login, password, customFields) {
    return dispatch => {
        dispatch(basic.updateAccess());
        backend.updateAccess(accessId, { login, password, customFields }).then(() => {
            dispatch(success.updateAccess());
        }).catch(err => {
            dispatch(fail.updateAccess(err));
        });
    };
}

let STORE = null;

export function importInstance(content) {

    // Defer loading of index, to not introduce an require cycle.
    /* eslint import/no-require: 0 */
    STORE = STORE || require('./index');

    return dispatch => {
        dispatch(basic.importInstance(content));
        backend.importInstance(content)
        .then(() => {
            dispatch(success.importInstance(content));
            return STORE.init();
        }).then(newState => {
            dispatch(basic.newState(newState));
        }).catch(err => {
            dispatch(fail.importInstance(err, content));
        });
    };
}

// Reducers
function reduceSet(state, action) {
    let { status, key, value } = action;

    if (status === SUCCESS) {
        debug('Setting successfully set', key);
        return u({
            map: { [key]: value }
        }, state);
    }

    if (status === FAIL) {
        debug('Error when updating setting', action.error);
    } else {
        debug('Updating setting...');
    }

    return state;
}

function reduceUpdateWeboob(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Weboob successfully updated');
        return u({ updatingWeboob: false }, state);
    }

    if (status === FAIL) {
        debug('Error when updating setting', action.error);
        return u({ updatingWeboob: false }, state);
    }

    debug('Updating setting...');
    return u({ updatingWeboob: true }, state);
}

function reduceUpdateAccess(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Successfully updated access');
        // Nothing to do yet: accesses are not locally saved.
        return state;
    }

    if (status === FAIL) {
        debug('Error when updating access', action.error);
        return state;
    }

    debug('Updating access...');
    return state;
}

function reduceImportInstance(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug('Successfully imported instance');
        // Main reducer is in the main store (for reloading the entire
        // instance).
        // processingReason is reset via the call to initialState().
        return state;
    }

    if (status === FAIL) {
        debug('Error when importing instance', action.error);
        return u({ processingReason: null }, state);
    }

    debug('Importing instance...');
    return u({ processingReason: $t('client.spinner.import') }, state);
}

const reducers = {
    IMPORT_INSTANCE: reduceImportInstance,
    SET_SETTING: reduceSet,
    UPDATE_WEBOOB: reduceUpdateWeboob,
    UPDATE_ACCESS: reduceUpdateAccess
};

export const reducer = createReducerFromMap(settingsState, reducers);

// Initial state
export function initialState(settings) {
    let map = {};

    for (let pair of settings) {
        assert(DefaultSettings.has(pair.name),
               `all settings must have their default value, missing for: ${pair.name}`);
        map[pair.name] = pair.value;
    }

    assert(typeof map.locale !== 'undefined', 'Kresus needs a locale');

    setupTranslator(map.locale);

    return u({
        map,
        updatingWeboob: false,
        processingReason: null
    }, {});
}

// Getters
export function getDefaultAccountId(state) {
    return state.map.defaultAccountId;
}

export function isWeboobUpdating(state) {
    return state.updatingWeboob;
}

export function backgroundProcessingReason(state) {
    return state.processingReason;
}

export function get(state, key) {
    assert(DefaultSettings.has(key),
           `all settings must have default values, but ${key} doesn't have one.`);

    if (typeof state.map[key] !== 'undefined')
        return state.map[key];

    return DefaultSettings.get(key);
}
