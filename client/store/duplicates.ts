import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as backend from './backend';
import { mergeTransactions, deleteTransaction, deleteAccount } from './banks';
import { enableDemo, importInstance } from './global';

import { assertDefined } from '../helpers';

import type { Duplicates } from '../../shared/types';

export interface DuplicatesState {
    items: Duplicates['new'];

    // Duplicates are lazy-loaded to speed-up the initial /all request: we need to track whether
    // they are loaded yet.
    isLoaded: boolean;
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

const initialState: DuplicatesState = {
    items: [],
    isLoaded: false,
};

const duplicatesSlice = createSlice({
    name: 'duplicates',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(updateDuplicatesList.fulfilled, (state, action) => {
                state.items = action.payload.new;
                state.isLoaded = true;
            })
            // After an import or a demo mode toggle, the known pairs refer to transactions which
            // don't exist anymore: forget them and wait for the new ones, which the duplicates
            // middleware is fetching.
            .addCase(importInstance.fulfilled, () => initialState)
            .addCase(enableDemo.fulfilled, () => initialState)
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

export function isLoaded(state: DuplicatesState): boolean {
    return state.isLoaded;
}
