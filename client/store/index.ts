import { configureStore, createListenerMiddleware, createAction, isAnyOf } from '@reduxjs/toolkit';

import { createSelector } from 'reselect';

import * as BankStore from './banks';
import * as BudgetStore from './budgets';
import * as CategoryStore from './categories';
import * as InstanceStore from './instance';
import * as RulesStore from './rules';
import * as SettingsStore from './settings';
import * as UiStore from './ui';
import * as GlobalStore from './global';

// Reset the stores' states following an instance import or the enablement of the demo mode.
// Any store that is subject to reset after these actions should be added to the list below or
// implement a reducer for these actions directly.
// This is meant for "stores" created as redux-toolkit slices. For legacy reducers see augmentReducer.
const storesToReset = [
    CategoryStore,
    BudgetStore,
    SettingsStore,
    UiStore,
    BankStore,
    RulesStore,
    InstanceStore,
];

export const resetGlobalState = createAction<any>('global/reset');

const resetStateMiddleware = createListenerMiddleware();
resetStateMiddleware.startListening({
    matcher: isAnyOf(
        resetGlobalState,
        GlobalStore.importInstance.fulfilled,
        GlobalStore.enableDemo.fulfilled
    ),
    effect: async (action, { dispatch }) => {
        const newGlobalState = action.payload as any;
        storesToReset.forEach(store => {
            if (newGlobalState[store.name]) {
                dispatch(store.actions.reset(newGlobalState[store.name]));
            }
        });
    },
});

// Store
export const reduxStore = configureStore({
    reducer: {
        banks: BankStore.reducer,
        budgets: BudgetStore.reducer,
        categories: CategoryStore.reducer,
        instance: InstanceStore.reducer,
        rules: RulesStore.reducer,
        settings: SettingsStore.reducer,
        ui: UiStore.reducer,
    },
    devTools: true,
    middleware: getDefaultMiddleware =>
        // See https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
        // We should have serializable models/states.
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(resetStateMiddleware.middleware),
});

declare global {
    type GlobalState = ReturnType<typeof reduxStore.getState>;
}

const memoizedUnusedCategories = createSelector(
    (state: GlobalState) => state.banks,
    (state: GlobalState) => state.categories,
    (banks, categories) => {
        return CategoryStore.allUnused(categories, BankStore.usedCategoriesSet(banks));
    }
);

export function getUnusedCategories(state: GlobalState) {
    return memoizedUnusedCategories(state);
}

export const init = GlobalStore.init;
