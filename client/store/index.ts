import {
    createSelector,
    configureStore,
    createListenerMiddleware,
    createAction,
    isAnyOf,
} from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { useDispatch, useSelector } from 'react-redux';

import * as BankStore from './banks';
import * as BudgetStore from './budgets';
import * as CategoryStore from './categories';
import * as InstanceStore from './instance';
import * as RulesStore from './rules';
import * as SettingsStore from './settings';
import * as UiStore from './ui';
import * as ViewStore from './views';
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
    ViewStore,
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
        views: ViewStore.reducer,
        ui: UiStore.reducer,
    },
    devTools: true,
    middleware: getDefaultMiddleware =>
        // See https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
        // We should have serializable models/states.
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(logger, resetStateMiddleware.middleware),
});

export type GlobalState = ReturnType<typeof reduxStore.getState>;

// A pre-typed useSelector that embeds the app's global state.
//
// The line below is necessary for eslint and prettier to behave.
// eslint-disable-next-line space-before-function-paren
export const useKresusState = function <T>(func: (state: GlobalState) => T): T {
    return useSelector<GlobalState, T>(func);
};

export const useKresusDispatch = () => useDispatch<typeof reduxStore.dispatch>();

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
