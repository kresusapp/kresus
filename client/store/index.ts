import {
    combineReducers,
    compose,
    createStore,
    applyMiddleware,
    AnyAction,
    Dispatch,
    Action as ReduxAction,
} from 'redux';

import { createSelector } from 'reselect';
import reduxThunk, { ThunkAction } from 'redux-thunk';

import { assertHas, debug } from '../helpers';
import {
    DARK_MODE,
    DEFAULT_ACCOUNT_ID,
    DEFAULT_CURRENCY,
    DEMO_MODE,
    FLUID_LAYOUT,
    LIMIT_ONGOING_TO_CURRENT_MONTH,
} from '../../shared/settings';
import { Account, Category, Transaction, Access, Alert } from '../models';

import { IMPORT_INSTANCE, ENABLE_DEMO_MODE } from './actions';
import * as backend from './backend';

import * as BankStore from './banks';
import * as BudgetStore from './budgets';
import * as CategoryStore from './categories';
import * as InstanceStore from './instance';
import * as RulesStore from './rules';
import * as SettingsStore from './settings';
import * as UiStore from './ui';

import { Action, actionStatus, createActionCreator, FAIL, SUCCESS } from './helpers';

export type GlobalState = {
    banks: BankStore.BankState;
    budgets: BudgetStore.BudgetState;
    categories: CategoryStore.CategoryState;
    instance: InstanceStore.InstanceState;
    rules: RulesStore.RuleState;
    settings: SettingsStore.SettingState;
    ui: UiStore.UiState;
};

export type KThunkAction<RetType = void> = ThunkAction<
    RetType,
    GlobalState,
    unknown,
    ReduxAction<string>
>;

export type GetStateType = () => GlobalState;

type ImportType = 'ofx' | 'json';

const actionsWithStateReset = [IMPORT_INSTANCE, ENABLE_DEMO_MODE];

// Augment basic reducers so that they can handle state reset:
// - if the event causes a state reset, pass the new sub-state to the reducer.
// - otherwise, apply to the actual reducer.
function augmentReducer<StateType>(
    reducer: (state: StateType | null, action: AnyAction) => StateType | null,
    field: keyof GlobalState
) {
    return (state: StateType, action: AnyAction) => {
        if (actionsWithStateReset.includes(action.type) && action.status === SUCCESS) {
            return reducer(action.state[field] as any as StateType, action);
        }
        return reducer(state, action);
    };
}

const rootReducer = combineReducers({
    banks: augmentReducer(BankStore.reducer, 'banks'),
    budgets: BudgetStore.reducer,
    categories: CategoryStore.reducer,
    instance: augmentReducer(InstanceStore.reducer, 'instance'),
    rules: augmentReducer(RulesStore.reducer, 'rules'),
    settings: SettingsStore.reducer,
    ui: UiStore.reducer,
});

interface AnyKresusActionParams {
    password?: string;
}

// A simple middleware to log which action is called, and its status if applicable.
const logger =
    () => (next: (action: AnyAction) => void) => (action: Action<AnyKresusActionParams>) => {
        if (action.status === SUCCESS) {
            debug(`Action ${action.type} completed with success.`);
        } else if (action.status === FAIL) {
            debug(`Action ${action.type} failed with error: `, action.err);
        } else {
            debug(`Action ${action.type} dispatched.`);
            let actionCopy;
            if (typeof action.password !== 'undefined') {
                actionCopy = { ...action };
                delete actionCopy.password;
            } else {
                actionCopy = action;
            }
            debug('Action payload: ', actionCopy);
        }

        return next(action);
    };

// Store
const composeEnhancers =
    (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
export const reduxStore = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(reduxThunk, logger))
);

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

export async function init(): Promise<GlobalState> {
    const world: {
        settings: SettingsStore.KeyValue[];
        instance: Record<string, string | null>;
        categories: Category[];
        transactions: Transaction[];
        accounts: Account[];
        alerts: Alert[];
        accesses: Access[];
    } = await backend.init();

    const state: Partial<GlobalState> = {};

    // Settings need to be loaded first, because locale information depends
    // upon them.
    assertHas(world, 'settings');
    state.settings = SettingsStore.makeInitialState(world.settings);

    assertHas(world, 'instance');
    state.instance = InstanceStore.initialState(world.instance);

    assertHas(world, 'categories');
    state.categories = CategoryStore.makeInitialState(world.categories);

    // Define external values for the Bank initialState:
    const external = {
        defaultCurrency: SettingsStore.get(state.settings, DEFAULT_CURRENCY),
        defaultAccountId: SettingsStore.get(state.settings, DEFAULT_ACCOUNT_ID),
        isOngoingLimitedToCurrentMonth: SettingsStore.getBool(
            state.settings,
            LIMIT_ONGOING_TO_CURRENT_MONTH
        ),
    };

    assertHas(world, 'accounts');
    assertHas(world, 'accesses');
    assertHas(world, 'transactions');
    assertHas(world, 'alerts');

    state.banks = BankStore.initialState(
        external,
        world.accesses,
        world.accounts,
        world.transactions,
        world.alerts
    );

    state.rules = RulesStore.initialState();

    state.budgets = BudgetStore.initialState;

    // The UI must be computed at the end.
    state.ui = UiStore.makeInitialState(
        SettingsStore.getBool(state.settings, DEMO_MODE),
        SettingsStore.getBool(state.settings, DARK_MODE),
        SettingsStore.getBool(state.settings, FLUID_LAYOUT)
    );

    return state as GlobalState;
}

// Global actions/reducers. All these actions lead to a full reset of the
// state, which is costly.

// Imports a whole instance.
export function importInstance(data: any, type: ImportType, maybePassword?: string) {
    return async (dispatch: Dispatch) => {
        const importBackend = type === 'ofx' ? backend.importOFX : backend.importInstance;

        const action = dispatch(importInstanceAction({}));
        dispatch(action);

        try {
            await importBackend(data, maybePassword);
            const state = await init();
            action.state = state;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type ImportInstanceParams = { state?: GlobalState };
const importInstanceAction = createActionCreator<ImportInstanceParams>(IMPORT_INSTANCE);

// Enables the demo mode.
export function enableDemo(enabled: boolean) {
    return async (dispatch: Dispatch) => {
        const action = enableDemoAction({ enabled });
        dispatch(action);
        try {
            if (enabled) {
                await backend.enableDemoMode();
            } else {
                await backend.disableDemoMode();
            }
            const state = await init();
            action.state = state;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

export type EnableDemoParams = {
    enabled: boolean;
    state?: GlobalState;
};
const enableDemoAction = createActionCreator<EnableDemoParams>(ENABLE_DEMO_MODE);
