import u from 'updeep';

import { assert, UNKNOWN_WEBOOB_VERSION } from '../helpers';
import { WEBOOB_INSTALLED, WEBOOB_VERSION } from '../../shared/instance';

import * as backend from './backend';
import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL } from './helpers';

import {
    EXPORT_INSTANCE,
    SEND_TEST_EMAIL,
    SEND_TEST_NOTIFICATION,
    UPDATE_WEBOOB,
    GET_WEBOOB_VERSION,
    FETCH_LOGS,
    CLEAR_LOGS,
} from './actions';

import Errors, { genericErrorHandler } from '../errors';

const settingsState = u({
    // A map of key to values.
    map: {},
});

// Basic action creators
const basic = {
    sendTestEmail() {
        return {
            type: SEND_TEST_EMAIL,
        };
    },

    sendTestNotification() {
        return {
            type: SEND_TEST_NOTIFICATION,
        };
    },

    updateWeboob() {
        return {
            type: UPDATE_WEBOOB,
        };
    },

    fetchWeboobVersion(version = UNKNOWN_WEBOOB_VERSION, isInstalled = null) {
        return {
            type: GET_WEBOOB_VERSION,
            version,
            isInstalled,
        };
    },

    fetchLogs(logs = null) {
        return {
            type: FETCH_LOGS,
            logs,
        };
    },

    clearLogs() {
        return {
            type: CLEAR_LOGS,
        };
    },

    exportInstance(password, content = null) {
        return {
            type: EXPORT_INSTANCE,
            password,
            content,
        };
    },
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

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

export function fetchLogs() {
    return dispatch => {
        dispatch(basic.fetchLogs());
        return backend
            .fetchLogs()
            .then(result => {
                dispatch(success.fetchLogs(result));
            })
            .catch(err => {
                dispatch(fail.fetchLogs(err));
                throw err;
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

function reduceFetchLogs(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u({ isLoadingLogs: false, logs: action.logs }, state);
    }

    if (status === FAIL) {
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

const reducers = {
    EXPORT_INSTANCE: reduceExportInstance,
    GET_WEBOOB_VERSION: reduceGetWeboobVersion,
    FETCH_LOGS: reduceFetchLogs,
    CLEAR_LOGS: reduceClearLogs,
};

export const reducer = createReducerFromMap(settingsState, reducers);

// Initial state
export function initialState(instanceProperties) {
    return u(
        {
            isLoadingLogs: false,
            logs: null,
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

export function getLogs(state) {
    return state.logs;
}
export function isLoadingLogs(state) {
    return state.isLoadingLogs;
}

export function getWeboobVersion(state) {
    return get(state, WEBOOB_VERSION);
}
