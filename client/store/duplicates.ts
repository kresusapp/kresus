import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as backend from './backend';
import { mergeTransactions, deleteTransaction, deleteAccount } from './banks';

import { assertDefined } from '../helpers';

import type { Duplicates } from '../../shared/types';

export interface DuplicatesState {
    items: Duplicates['new'];
}

export const updateDuplicatesList = createAsyncThunk('duplicates/list', async () => {
    const dups = await backend.fetchDuplicates();
    return dups;
});

function removePairsWithTransaction(state: DuplicatesState, transactionId: number): void {
    for (const list of state.items) {
        list.duplicates = list.duplicates.filter(
            pair => pair[0] !== transactionId && pair[1] !== transactionId
        );
    }
}

// Initial state for the duplicates store.
function makeInitialState(duplicates: Duplicates): DuplicatesState {
    return {
        items: duplicates.new,
    };
}

const duplicatesSlice = createSlice({
    name: 'duplicates',
    initialState: makeInitialState({ new: [] }),
    reducers: {
        reset(_state, action) {
            // This is meant to be used as a redux toolkit reducer, using immutable under the hood.
            // Returning a value here will overwrite the state.
            return makeInitialState(action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(updateDuplicatesList.fulfilled, (state, action) => {
                const newDuplicates = action.payload.new;
                state.items = newDuplicates;
            })
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                const deleted = action.payload;
                assertDefined(deleted);

                removePairsWithTransaction(state, deleted.transactionId);
            })
            .addCase(mergeTransactions.fulfilled, (state, action) => {
                const { toRemove } = action.payload;
                assertDefined(toRemove);

                removePairsWithTransaction(state, toRemove.id);
            })
            .addCase(deleteAccount.fulfilled, (state, action) => {
                const accountId = action.payload;
                state.items = state.items.filter(item => item.accountId !== accountId);
            });
    },
});

export const name = duplicatesSlice.name;

export const actions = duplicatesSlice.actions;

export const reducer = duplicatesSlice.reducer;

// Getters
export function byAccountId(state: DuplicatesState, accountId: number): Duplicates['new'] {
    const accountDuplicates = state.items.filter(itm => itm.accountId === accountId);
    return accountDuplicates ? accountDuplicates : [];
}
