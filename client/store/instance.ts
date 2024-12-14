import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { assert, assertDefined, UNKNOWN_WOOB_VERSION } from '../helpers';
import { WOOB_INSTALLED, WOOB_VERSION } from '../../shared/instance';

import * as backend from './backend';

import Errors from '../errors';

import { resetStoreReducer } from './helpers';

export type InstanceState = Record<string, string | null>;

// Retrieves the version of Woob that's used.
export const fetchWoobVersion = createAsyncThunk(
    'instance/fetchWoobVersion',
    async (_params: undefined, { rejectWithValue }) => {
        try {
            const result = await backend.fetchWoobVersion();
            return result;
        } catch (error: unknown) {
            rejectWithValue(error);
        }
    }
);

// Exports the whole instance and returns the text.
export function exportInstance(maybePassword: string | undefined) {
    return backend.exportInstance(maybePassword);
}

// Initial state.
function makeInitialState(instanceProperties: InstanceState): InstanceState {
    return { ...instanceProperties };
}

export const instanceSlice = createSlice({
    name: 'instance',
    initialState: makeInitialState({
        WOOB_INSTALLED: 'false',
        WOOB_VERSION: null,
    }),
    reducers: {
        reset: resetStoreReducer<InstanceState>,

        resetWoobVersion(state) {
            state.WOOB_VERSION = UNKNOWN_WOOB_VERSION;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchWoobVersion.fulfilled, (state, action) => {
                assertDefined(action.payload.version);
                state[WOOB_VERSION] = action.payload.version;
                if (typeof action.payload.hasMinimalVersion !== 'undefined') {
                    state[WOOB_INSTALLED] = action.payload.hasMinimalVersion.toString();
                }
            })
            .addCase(fetchWoobVersion.rejected, (state, action) => {
                if ((action.payload as { code: string }).code === Errors.WOOB_NOT_INSTALLED) {
                    state[WOOB_INSTALLED] = 'false';
                } else {
                    state[WOOB_VERSION] = null;
                }
            });
    },
});

export const name = instanceSlice.name;

export const actions = instanceSlice.actions;

export const reducer = instanceSlice.reducer;

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
