import { produce } from 'immer';

import { assertDefined, assertNotNull, UNKNOWN_WEBOOB_VERSION } from '../helpers';
import { WEBOOB_INSTALLED, WEBOOB_VERSION } from '../../shared/instance';

import * as backend from './backend';
import {
    createReducerFromMap,
    SUCCESS,
    FAIL,
    createActionCreator,
    actionStatus,
    Action,
} from './new-helpers';

import { GET_WEBOOB_VERSION } from './actions';

import Errors from '../errors';
import { Dispatch } from 'redux';

export type InstanceState = Record<string, string | null>;

// Send a test email to the given email address.
export function sendTestEmail(email: string) {
    return backend.sendTestEmail(email);
}

// Send a test notification using the given Apprise parameters as a URI.
export function sendTestNotification(appriseUrl: string) {
    return backend.sendTestNotification(appriseUrl);
}

// Fetches the logs from the server.
export function fetchLogs() {
    return backend.fetchLogs();
}

// Clears the logs on the server.
export function clearLogs() {
    return backend.clearLogs();
}

// Update weboob.
export function updateWeboob() {
    return backend.updateWeboob();
}

// Retrieves the version of Weboob that's used.
export function fetchWeboobVersion() {
    return async (dispatch: Dispatch) => {
        const action = fetchWeboobVersionAction({});
        try {
            const result = await backend.fetchWeboobVersion();
            const { version, hasMinimalVersion } = result;
            action.version = version;
            action.hasMinimalVersion = hasMinimalVersion;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type FetchWeboobVersionParams = { version?: string | null; hasMinimalVersion?: boolean };
const fetchWeboobVersionAction = createActionCreator<FetchWeboobVersionParams>(GET_WEBOOB_VERSION);

export function resetWeboobVersion() {
    return actionStatus.ok(fetchWeboobVersionAction({ version: UNKNOWN_WEBOOB_VERSION }));
}

function reduceGetWeboobVersion(state: InstanceState, action: Action<FetchWeboobVersionParams>) {
    if (action.status === SUCCESS) {
        return produce(state, draft => {
            assertDefined(action.version);
            assertNotNull(action.version);
            draft[WEBOOB_VERSION] = action.version;
            if (typeof action.hasMinimalVersion !== 'undefined') {
                draft[WEBOOB_INSTALLED] = action.hasMinimalVersion.toString();
            }
        });
    }

    if (action.status === FAIL) {
        return produce(state, draft => {
            if (action.err.code === Errors.WEBOOB_NOT_INSTALLED) {
                draft[WEBOOB_INSTALLED] = 'false';
            } else {
                draft[WEBOOB_VERSION] = null;
            }
            return draft;
        });
    }

    return state;
}

// Exports the whole instance and returns the text.
export function exportInstance(maybePassword: string | undefined) {
    return backend.exportInstance(maybePassword);
}

const reducers = {
    [GET_WEBOOB_VERSION]: reduceGetWeboobVersion,
};

export const reducer = createReducerFromMap(reducers);

// Initial state
export function initialState(instanceProperties: InstanceState): InstanceState {
    return { ...instanceProperties };
}

// Getters
export function get(state: InstanceState, key: string): string | null {
    if (typeof state[key] !== 'undefined') {
        return state[key];
    }
    return null;
}

export function getWeboobVersion(state: InstanceState): string {
    const version = get(state, WEBOOB_VERSION);
    assertNotNull(version);
    return version;
}
