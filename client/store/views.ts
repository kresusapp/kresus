import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { assertDefined } from '../helpers';

import { View } from '../models';

import { createAccess, runAccountsSync } from './banks';

export interface ViewState {
    items: View[];
}

const viewsSlice = createSlice({
    name: 'views',
    initialState: [] as unknown as ViewState,
    reducers: {
        reset(_state, action) {
            // This is meant to be used as a redux toolkit reducer, using immutable under the hood.
            // Returning a value here will overwrite the state.
            return {
                items: action.payload,
            };
        },
    },
    extraReducers: builder => {
        builder.addMatcher(
            isAnyOf(createAccess.fulfilled, runAccountsSync.fulfilled),
            (state, action) => {
                const { views } = action.payload;
                assertDefined(views);

                state.items = views.map((view: any) => ({
                    ...view,
                    type: 'id',
                    accounts: view.accounts.map((acc: { accountId: number }) => acc.accountId),
                }));
            }
        );
    },
});

export const name = viewsSlice.name;

export const actions = viewsSlice.actions;

export const reducer = viewsSlice.reducer;

// Getters
export function all(state: ViewState): View[] {
    return state.items;
}

export function fromId(state: ViewState, id: number): View | null {
    return state.items.find(view => view.id === id) || null;
}

export function fromCurrencyCode(state: ViewState, currencyCode: string): View | null {
    return state.items.find(view => view.currency === currencyCode) || null;
}

export function fromAccountId(state: ViewState, accountId: number) {
    return (
        state.items.find(
            view =>
                view.type === 'id' && view.accounts.length === 1 && view.accounts[0] === accountId
        ) || null
    );
}
