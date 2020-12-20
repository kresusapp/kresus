import u from 'updeep';

import { UNKNOWN_WEBOOB_VERSION } from '../helpers';
import { WEBOOB_INSTALLED, WEBOOB_VERSION } from '../../shared/instance';

import * as backend from './backend';
import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL } from './helpers';

import { GET_WEBOOB_VERSION } from './actions';

import Errors from '../errors';

const settingsState = u({
    // A map of key to values.
    map: {},
});

// Basic action creators
const basic = {
    fetchWeboobVersion(version = UNKNOWN_WEBOOB_VERSION, isInstalled = null) {
        return {
            type: GET_WEBOOB_VERSION,
            version,
            isInstalled,
        };
    },
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

export function sendTestEmail(email) {
    return backend.sendTestEmail(email);
}

export function sendTestNotification(appriseUrl) {
    return backend.sendTestNotification(appriseUrl);
}

// Update weboob.
export function updateWeboob() {
    return backend.updateWeboob();
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
                return Promise.resolve();
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

export function fetchLogs() {
    return backend.fetchLogs();
}

export function clearLogs() {
    return backend.clearLogs();
}

function reduceGetWeboobVersion(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let stateUpdates = { map: { WEBOOB_VERSION: action.version } };

        if (typeof action.isInstalled === 'boolean') {
            stateUpdates.map[WEBOOB_INSTALLED] = action.isInstalled.toString();
        }

        return u(stateUpdates, state);
    }

    if (status === FAIL) {
        if (action.error.code === Errors.WEBOOB_NOT_INSTALLED) {
            return u({ map: { WEBOOB_INSTALLED: 'false' } }, state);
        }

        return u({ map: { WEBOOB_VERSION: null } }, state);
    }

    return state;
}

export function exportInstance(maybePassword) {
    return backend.exportInstance(maybePassword);
}

const reducers = {
    GET_WEBOOB_VERSION: reduceGetWeboobVersion,
};

export const reducer = createReducerFromMap(settingsState, reducers);

// Initial state
export function initialState(instanceProperties) {
    return u(
        {
            map: instanceProperties,
        },
        {}
    );
}

// Getters
export function get(state, key) {
    if (typeof state.map[key] !== 'undefined') {
        return state.map[key];
    }

    return null;
}

export function getWeboobVersion(state) {
    return get(state, WEBOOB_VERSION);
}
