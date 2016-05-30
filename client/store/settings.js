import u from 'updeep';

import DefaultSettings from '../../shared/default-settings';

import { has, assert, debug, setupTranslator, translate as $t } from '../helpers';
import { Setting } from '../models';

import * as backend from './backend';
import { createReducerFromMap, makeStatusHandlers, SUCCESS, FAIL } from './helpers';

const settingsState = u({
    // A map of key to values.
    map: {}
});

// Actions
const SET_SETTING = "SET_SETTING";
const UPDATE_WEBOOB = "UPDATE_WEBOOB";

// Basic action creators
const basic = {

    set(key, value) {
        return {
            type: SET_SETTING,
            key,
            value
        }
    },

    updateWeboob() {
        return {
            type: UPDATE_WEBOOB
        }
    }

};

const [ failSet, successSet ] = makeStatusHandlers(basic.set);
const [ failUpdateWeboob, successUpdateWeboob ] = makeStatusHandlers(basic.updateWeboob);

export function set(key, value) {
    assert(typeof key === 'string', 'key must be a string');
    assert(typeof value === 'string', 'value must be a string');
    assert(key.length + value.length, 'key and value must be non-empty');

    return dispatch => {
        dispatch(basic.set(key, value));
        backend.saveSetting(String(key), String(value))
        .then(() => {
            dispatch(successSet(key, value));
        }).catch(err => {
            dispatch(failSet(err, key, value));
        });
    };
}

export function updateWeboob() {
    return dispatch => {
        dispatch(basic.updateWeboob());
        backend.updateWeboob().then(() => {
            dispatch(successUpdateWeboob());
        }).catch(err => {
            dispatch(failUpdateWeboob(err));
        });
    };
}

// Reducers
function reduceSet(state, action) {
    let { status, key, value } = action;
    if (status === SUCCESS) {
        debug("Setting successfully set", key);
        return u({
            map: { [key]: value }
        }, state);
    }

    if (status === FAIL) {
        debug("Error when updating setting", action.error);
    } else {
        debug("Updating setting...");
    }

    return state;
}

function reduceUpdateWeboob(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        debug("Weboob successfully updated");
        return u({ updatingWeboob: false }, state);
    } else if (status === FAIL) {
        debug("Error when updating setting", action.error);
        return u({ updatingWeboob: false }, state);
    } else {
        debug("Updating setting...");
        return u({ updatingWeboob: true }, state);
    }

    assert(false, 'unreachable');
}

const reducers = {
    SET_SETTING: reduceSet,
    UPDATE_WEBOOB: reduceUpdateWeboob
};

export let reducer = createReducerFromMap(settingsState, reducers);

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
        map
    }, {});
}

// Getters
export function getDefaultAccountId(state) {
    return state.map['defaultAccountId'];
}

export function get(state, key) {
    assert(DefaultSettings.has(key),
           `all settings must have default values, but ${key} doesn't have one.`);

    if (typeof state.map[key] !== 'undefined')
        return state.map[key];

    return DefaultSettings.get(key);
}
