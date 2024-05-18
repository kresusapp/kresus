import { produce } from 'immer';

import { assert, assertDefined, UNKNOWN_WOOB_VERSION } from '../helpers';
import { WOOB_INSTALLED, WOOB_VERSION } from '../../shared/instance';

import * as backend from './backend';
import {
    createReducerFromMap,
    SUCCESS,
    FAIL,
    createActionCreator,
    actionStatus,
    Action,
} from './helpers';

import { GET_WOOB_VERSION } from './actions';

import Errors from '../errors';
import { Dispatch } from 'redux';

export type InstanceState = Record<string, string | null>;

// Retrieves the version of Woob that's used.
export function fetchWoobVersion() {
    return async (dispatch: Dispatch) => {
        const action = fetchWoobVersionAction({});
        try {
            const result = await backend.fetchWoobVersion();
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

type FetchWoobVersionParams = { version?: string | null; hasMinimalVersion?: boolean };
const fetchWoobVersionAction = createActionCreator<FetchWoobVersionParams>(GET_WOOB_VERSION);

export function resetWoobVersion() {
    return actionStatus.ok(fetchWoobVersionAction({ version: UNKNOWN_WOOB_VERSION }));
}

function reduceGetWoobVersion(state: InstanceState, action: Action<FetchWoobVersionParams>) {
    if (action.status === SUCCESS) {
        return produce(state, draft => {
            assertDefined(action.version);
            draft[WOOB_VERSION] = action.version;
            if (typeof action.hasMinimalVersion !== 'undefined') {
                draft[WOOB_INSTALLED] = action.hasMinimalVersion.toString();
            }
        });
    }

    if (action.status === FAIL) {
        return produce(state, draft => {
            if (action.err.code === Errors.WOOB_NOT_INSTALLED) {
                draft[WOOB_INSTALLED] = 'false';
            } else {
                draft[WOOB_VERSION] = null;
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
    [GET_WOOB_VERSION]: reduceGetWoobVersion,
};

export const reducer = createReducerFromMap(reducers);

// Initial state.
export function initialState(instanceProperties: InstanceState): InstanceState {
    return { ...instanceProperties };
}

// Getters.
export function get(state: InstanceState, key: string): string | null {
    if (typeof state[key] !== 'undefined') {
        return state[key];
    }
    return null;
}

export function getBool(state: InstanceState, key: string) {
    const val = get(state, key);
    assert(val === 'true' || val === 'false', 'A bool instance property must be true or false');
    return val === 'true';
}
