import { createSlice, isAnyOf } from '@reduxjs/toolkit';

import { assertDefined } from '../helpers';

import { Account, View } from '../models';

import { createAccess, runAccountsSync } from './banks';

export interface ViewState {
    items: View[];
}

export type ServerView = Omit<View, 'accounts'> & {
    accounts: {
        accountId: number;
    }[];
};

export function regenerateAllViews(
    serverViews: ServerView[],
    accounts: Account[],
    defaultCurrency: string
): View[] {
    const views: View[] = serverViews.map(view => ({
        ...view,
        type: 'id',
        accounts: view.accounts.map(acc => acc.accountId),
    }));

    // For each account currency, automatically create a view.
    const accountCurrencies = new Map<string, number[]>();
    for (const account of accounts) {
        // Some accounts don't seem to have a currency somehow…
        const accountCurrency = account.currency || defaultCurrency;

        if (!accountCurrency) {
            continue;
        }

        if (!accountCurrencies.has(accountCurrency)) {
            accountCurrencies.set(accountCurrency, []);
        }

        accountCurrencies.get(accountCurrency)?.push(account.id);
    }

    for (const [currency, accountIds] of accountCurrencies) {
        views.push({
            id: -1,
            createdByUser: false,
            type: 'currency',
            label: currency,
            currency,
            accounts: accountIds,
        });
    }

    return views;
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
            // Note: make sure that these actions return the expected fields on success.
            isAnyOf(createAccess.fulfilled, runAccountsSync.fulfilled),
            (state, action) => {
                const { views, accounts, defaultCurrency } = action.payload;
                assertDefined(views);
                assertDefined(accounts);
                assertDefined(defaultCurrency);

                state.items = regenerateAllViews(views, accounts, defaultCurrency);
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
