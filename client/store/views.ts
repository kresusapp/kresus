import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';

import { assertDefined, assert } from '../helpers';

import { Account, View } from '../models';

import { createAccess, runAccountsSync } from './banks';

import { mergeInArray, removeInArrayById } from './helpers';
import * as backend from './backend';

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

export const create = createAsyncThunk(
    'views/create',
    async (params: { label: string; accounts: number[] }) => {
        const serverView: Partial<ServerView> = {
            label: params.label,
            createdByUser: true,
            accounts: params.accounts.map(accountId => ({ accountId })),
        };

        const created = (await backend.createView(serverView)) as ServerView;
        return {
            ...created,
            accounts: created.accounts.map(acc => acc.accountId),
        };
    }
);

// Update the given `former` view with the new fields defined in `view`.
export const update = createAsyncThunk(
    'views/update',
    async (params: { former: View; view: { label?: string; accounts?: number[] } }) => {
        const serverViewFields: Partial<ServerView> = {};
        if (params.view.label) {
            serverViewFields.label = params.view.label;
        }

        if (params.view.accounts && params.view.accounts.length) {
            serverViewFields.accounts = params.view.accounts.map(accountId => ({ accountId }));
        }

        const updated = (await backend.updateView(
            params.former.id,
            serverViewFields
        )) as ServerView;
        return {
            ...updated,
            accounts: updated.accounts.map(acc => acc.accountId),
        };
    }
);

export const destroy = createAsyncThunk('views/destroy', async (viewId: number) => {
    await backend.deleteView(viewId);
    return viewId;
});

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
        builder
            .addCase(create.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(update.fulfilled, (state, action) => {
                const view = action.payload;
                assert(typeof view.id === 'number', 'id must be defined for edits');
                mergeInArray(state.items, view.id, view as View);
            })
            .addCase(destroy.fulfilled, (state, action) => {
                removeInArrayById(state.items, action.payload);
            })
            .addMatcher(
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

export function allUserViews(state: ViewState): View[] {
    return state.items.filter(v => v.createdByUser);
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
