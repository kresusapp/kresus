import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as backend from './backend';
import { mergeTransactions, deleteTransaction, deleteAccount } from './banks';
import { enableDemo, importInstance } from './global';

import { assertDefined } from '../helpers';

import type { DuplicatesByAccount } from '../../shared/types';

export interface DuplicatesState {
    items: DuplicatesByAccount;
    ignoredItems: DuplicatesByAccount;

    // Duplicates are lazy-loaded to speed-up the initial /all request: we need to track whether
    // they are loaded yet.
    isLoaded: boolean;
}

export const updateDuplicatesList = createAsyncThunk('duplicates/list', async () => {
    const dups = await backend.fetchDuplicates();
    return dups;
});

export const ignoreDuplicate = createAsyncThunk(
    'duplicates/ignore',
    async (params: { accountId: number; transactionId: number; otherTransactionId: number }) => {
        await backend.ignoreDuplicate(params.transactionId, params.otherTransactionId);
        return params;
    }
);

export const unignoreDuplicate = createAsyncThunk(
    'duplicates/unignore',
    async (params: { accountId: number; transactionId: number; otherTransactionId: number }) => {
        // The server tells us whether the pair is detected as a duplicate again, so that it can
        // be put back in the duplicates list without refetching the whole list.
        const { isDuplicate } = await backend.unignoreDuplicate(
            params.transactionId,
            params.otherTransactionId
        );
        return { ...params, isDuplicate };
    }
);

function isSamePair(pair: [number, number], first: number, second: number): boolean {
    return (pair[0] === first && pair[1] === second) || (pair[0] === second && pair[1] === first);
}

function removePair(list: DuplicatesByAccount, first: number, second: number): void {
    for (const item of list) {
        item.duplicates = item.duplicates.filter(pair => !isSamePair(pair, first, second));
    }
}

function addPair(
    list: DuplicatesByAccount,
    accountId: number,
    first: number,
    second: number
): void {
    const forAccount = list.find(item => item.accountId === accountId);
    if (forAccount) {
        forAccount.duplicates.push([first, second]);
    } else {
        list.push({ accountId, duplicates: [[first, second]] });
    }
}

function removePairsWithTransaction(state: DuplicatesState, transactionId: number): void {
    const keepPairsWithoutTransaction = (item: DuplicatesByAccount[number]) => {
        item.duplicates = item.duplicates.filter(
            pair => pair[0] !== transactionId && pair[1] !== transactionId
        );
    };

    for (const item of state.items) {
        keepPairsWithoutTransaction(item);
    }

    for (const item of state.ignoredItems) {
        keepPairsWithoutTransaction(item);
    }
}

const initialState: DuplicatesState = {
    items: [],
    ignoredItems: [],
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
                state.ignoredItems = action.payload.ignored;
                state.isLoaded = true;
            })
            // After an import or a demo mode toggle, the known pairs refer to transactions which
            // don't exist anymore: forget them and wait for the new ones, which the duplicates
            // middleware is fetching.
            .addCase(importInstance.fulfilled, () => initialState)
            .addCase(enableDemo.fulfilled, () => initialState)
            .addCase(ignoreDuplicate.fulfilled, (state, action) => {
                const { accountId, transactionId, otherTransactionId } = action.payload;

                // Move the pair from the detected duplicates to the ignored ones.
                removePair(state.items, transactionId, otherTransactionId);
                addPair(state.ignoredItems, accountId, transactionId, otherTransactionId);
            })
            .addCase(unignoreDuplicate.fulfilled, (state, action) => {
                const { accountId, transactionId, otherTransactionId, isDuplicate } =
                    action.payload;

                removePair(state.ignoredItems, transactionId, otherTransactionId);

                // The pair might not be considered a duplicate anymore, e.g. if the threshold
                // was lowered or one of the transactions was edited since it was ignored.
                if (isDuplicate) {
                    addPair(state.items, accountId, transactionId, otherTransactionId);
                }
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
                state.ignoredItems = state.ignoredItems.filter(
                    item => item.accountId !== accountId
                );
            });
    },
});

export const name = duplicatesSlice.name;

export const actions = duplicatesSlice.actions;

export const reducer = duplicatesSlice.reducer;

// Getters
export function byAccountId(state: DuplicatesState, accountId: number): DuplicatesByAccount {
    return state.items.filter(itm => itm.accountId === accountId);
}

export function ignoredByAccountId(state: DuplicatesState, accountId: number): DuplicatesByAccount {
    return state.ignoredItems.filter(itm => itm.accountId === accountId);
}

export function isLoaded(state: DuplicatesState): boolean {
    return state.isLoaded;
}
