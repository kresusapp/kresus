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

import { assert, assertHas, debug } from '../helpers';
import { WEBOOB_INSTALLED } from '../../shared/instance';
import {
    DARK_MODE,
    DEFAULT_ACCOUNT_ID,
    DEFAULT_CURRENCY,
    DEMO_MODE,
    FLUID_LAYOUT,
} from '../../shared/settings';
import {
    Account,
    AccessCustomField,
    AlertType,
    Budget,
    Category,
    Operation,
    Access,
    Alert,
} from '../models';

import { IMPORT_INSTANCE, ENABLE_DEMO_MODE } from './actions';
import * as backend from './backend';
import * as BankStore from './banks';
import * as CategoryStore from './categories';
import * as BudgetStore from './budgets';
import * as SettingsStore from './settings';
import * as InstanceStore from './instance';
import * as UiStore from './ui';
import { actionStatus, createActionCreator, FAIL, SUCCESS } from './helpers';

export type GlobalState = {
    banks: BankStore.BankState;
    budgets: BudgetStore.BudgetState;
    categories: CategoryStore.CategoryState;
    instance: InstanceStore.InstanceState;
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
            return reducer((action.state[field] as any) as StateType, action);
        }
        return reducer(state, action);
    };
}

const rootReducer = combineReducers({
    banks: augmentReducer(BankStore.reducer, 'banks'),
    budgets: augmentReducer(BudgetStore.reducer, 'budgets'),
    categories: augmentReducer(CategoryStore.reducer, 'categories'),
    instance: augmentReducer(InstanceStore.reducer, 'instance'),
    settings: augmentReducer(SettingsStore.reducer, 'settings'),
    ui: augmentReducer(UiStore.reducer, 'ui'),
});

// A simple middleware to log which action is called, and its status if applicable.
const logger = () => (next: (action: AnyAction) => void) => (action: AnyAction) => {
    const { status }: { status: typeof SUCCESS | typeof FAIL | null } = action as any;
    if (status === SUCCESS) {
        debug(`Action ${action.type} completed with success.`);
    } else if (status === FAIL) {
        debug(`Action ${action.type} failed with error: `, action.error);
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

export const get = {
    // *** Banks **************************************************************

    activeBanks(state: GlobalState) {
        return BankStore.allActiveStaticBanks(state.banks);
    },
    bankByUuid(state: GlobalState, uuid: string) {
        return BankStore.bankByUuid(state.banks, uuid);
    },
    accountById(state: GlobalState, accountId: number) {
        return BankStore.accountById(state.banks, accountId);
    },
    accountExists(state: GlobalState, accountId: number) {
        return BankStore.accountExists(state.banks, accountId);
    },
    accessByAccountId(state: GlobalState, accountId: number) {
        return BankStore.accessByAccountId(state.banks, accountId);
    },
    initialAccountId(state: GlobalState) {
        return BankStore.getCurrentAccountId(state.banks);
    },
    accessExists(state: GlobalState, accessId: number) {
        return BankStore.accessExists(state.banks, accessId);
    },
    accessById(state: GlobalState, accessId: number) {
        return BankStore.accessById(state.banks, accessId);
    },
    accessIds(state: GlobalState) {
        return BankStore.getAccessIds(state.banks);
    },
    accessTotal(state: GlobalState, accessId: number) {
        return BankStore.computeAccessTotal(state.banks, accessId);
    },
    accountIdsByAccessId(state: GlobalState, accessId: number) {
        return BankStore.accountIdsByAccessId(state.banks, accessId);
    },
    operationIdsByAccountId(state: GlobalState, accountId: number) {
        return BankStore.operationIdsByAccountId(state.banks, accountId);
    },
    operationIdsByAccountIds(state: GlobalState, accountIds: number[]) {
        let accountIdsArray = accountIds;
        if (!(accountIdsArray instanceof Array)) {
            accountIdsArray = [accountIdsArray];
        }
        let transactionIds: number[] = [];
        for (const accountId of accountIdsArray) {
            transactionIds = transactionIds.concat(this.operationIdsByAccountId(state, accountId));
        }
        return transactionIds;
    },
    operationsByAccountId(state: GlobalState, accountId: number) {
        return BankStore.operationsByAccountId(state.banks, accountId);
    },
    operationIdsByCategoryId(state: GlobalState, categoryId: number) {
        return BankStore.operationIdsByCategoryId(state.banks, categoryId);
    },
    operationById(state: GlobalState, id: number) {
        return BankStore.operationById(state.banks, id);
    },
    transactionExists(state: GlobalState, id: number) {
        return BankStore.transactionExists(state.banks, id);
    },
    defaultAccountId(state: GlobalState) {
        return BankStore.getDefaultAccountId(state.banks);
    },
    types(state: GlobalState) {
        return BankStore.allTypes(state.banks);
    },
    alerts(state: GlobalState, type: AlertType) {
        return BankStore.alertPairsByType(state.banks, type);
    },

    // *** UI *****************************************************************

    searchFields(state: GlobalState) {
        return UiStore.getSearchFields(state.ui);
    },
    hasSearchFields(state: GlobalState) {
        return UiStore.hasSearchFields(state.ui);
    },
    backgroundProcessingReason(state: GlobalState) {
        return UiStore.getProcessingReason(state.ui);
    },
    userActionRequested(state: GlobalState) {
        return UiStore.userActionRequested(state.ui);
    },
    displaySearchDetails(state: GlobalState) {
        return UiStore.getDisplaySearchDetails(state.ui);
    },
    isMenuHidden(state: GlobalState) {
        return UiStore.isMenuHidden(state.ui);
    },
    isDemoMode(state: GlobalState) {
        return UiStore.isDemoMode(state.ui);
    },

    // *** Categories *********************************************************

    categories(state: GlobalState) {
        return CategoryStore.all(state.categories);
    },
    categoriesButNone(state: GlobalState) {
        return CategoryStore.allButNone(state.categories);
    },
    unusedCategories(state: GlobalState) {
        return memoizedUnusedCategories(state);
    },
    categoryById(state: GlobalState, id: number) {
        return CategoryStore.fromId(state.categories, id);
    },

    // *** Budgets ************************************************************

    budgetSelectedPeriod(state: GlobalState) {
        return BudgetStore.getSelectedPeriod(state.budgets);
    },
    budgetsFromSelectedPeriod(state: GlobalState) {
        return BudgetStore.fromSelectedPeriod(state.budgets);
    },

    // *** Instance properties*************************************************

    instanceProperty(state: GlobalState, key: string): string | null {
        return InstanceStore.get(state.instance, key);
    },
    boolInstanceProperty(state: GlobalState, key: string): boolean {
        const val = this.instanceProperty(state, key);
        assert(val === 'true' || val === 'false', 'A bool instance property must be true or false');
        return val === 'true';
    },

    // *** Settings ***********************************************************

    setting(state: GlobalState, key: string) {
        return SettingsStore.get(state.settings, key);
    },
    boolSetting(state: GlobalState, key: string) {
        const val = this.setting(state, key);
        assert(val === 'true' || val === 'false', 'A bool setting must be true or false');
        return val === 'true';
    },

    // *** Instance ***********************************************************

    isWeboobInstalled(state: GlobalState) {
        return this.boolInstanceProperty(state, WEBOOB_INSTALLED);
    },
    weboobVersion(state: GlobalState) {
        return InstanceStore.getWeboobVersion(state.instance);
    },

    // *** UI *****************************************************************

    isSmallScreen(state: GlobalState) {
        return UiStore.isSmallScreen(state.ui);
    },
};

export const actions = {
    // *** Banks **************************************************************

    runOperationsSync(dispatch: Dispatch, accessId: number) {
        return dispatch(BankStore.runOperationsSync(accessId));
    },
    applyBulkEdit(dispatch: Dispatch, newFields: BankStore.BulkEditFields, transactions: number[]) {
        return dispatch(BankStore.applyBulkEdit(newFields, transactions));
    },
    setOperationCategory(
        dispatch: Dispatch,
        transactionId: number,
        catId: number,
        formerCatId: number
    ) {
        return dispatch(BankStore.setOperationCategory(transactionId, catId, formerCatId));
    },
    setOperationType(dispatch: Dispatch, operationId: number, type: string, formerType: string) {
        return dispatch(BankStore.setOperationType(operationId, type, formerType));
    },
    setOperationCustomLabel(dispatch: Dispatch, operation: Operation, label: string) {
        return dispatch(BankStore.setOperationCustomLabel(operation, label));
    },
    setOperationBudgetDate(dispatch: Dispatch, operation: Operation, budgetDate: Date | null) {
        return dispatch(BankStore.setOperationBudgetDate(operation, budgetDate));
    },
    mergeOperations(dispatch: Dispatch, toKeep: Operation, toRemove: Operation) {
        return dispatch(BankStore.mergeOperations(toKeep, toRemove));
    },
    runAccountsSync(dispatch: Dispatch, accessId: number) {
        return dispatch(BankStore.runAccountsSync(accessId));
    },
    resyncBalance(dispatch: Dispatch, accountId: number) {
        return dispatch(BankStore.resyncBalance(accountId));
    },
    updateAccount(
        dispatch: Dispatch,
        accountId: number,
        newFields: Partial<Account>,
        previousAttributes: Partial<Account>
    ) {
        return dispatch(BankStore.updateAccount(accountId, newFields, previousAttributes));
    },
    deleteAccount(dispatch: Dispatch, accountId: number) {
        return dispatch(BankStore.deleteAccount(accountId));
    },
    createAccess(
        dispatch: Dispatch,
        uuid: string,
        login: string,
        password: string,
        fields: AccessCustomField[],
        customLabel: string | null,
        createDefaultAlerts: boolean
    ) {
        return dispatch(
            BankStore.createAccess({
                uuid,
                login,
                password,
                fields,
                customLabel,
                shouldCreateDefaultAlerts: createDefaultAlerts,
            })
        );
    },
    updateAndFetchAccess(
        dispatch: Dispatch,
        accessId: number,
        login: string,
        password: string,
        customFields: AccessCustomField[]
    ) {
        return dispatch(BankStore.updateAndFetchAccess(accessId, login, password, customFields));
    },
    updateAccess(
        dispatch: Dispatch,
        accessId: number,
        update: Partial<Access>,
        old: Partial<Access>
    ) {
        return dispatch(BankStore.updateAccess(accessId, update, old));
    },
    deleteAccess(dispatch: Dispatch, accessId: number) {
        return dispatch(BankStore.deleteAccess(accessId));
    },
    disableAccess(dispatch: Dispatch, accessId: number) {
        return dispatch(BankStore.disableAccess(accessId));
    },
    setDefaultAccountId(dispatch: Dispatch, accountId: number | null) {
        return dispatch(BankStore.setDefaultAccountId(accountId));
    },
    createOperation(dispatch: Dispatch, newOperation: Partial<Operation>) {
        return dispatch(BankStore.createOperation(newOperation));
    },
    deleteOperation(dispatch: Dispatch, operationId: number) {
        return dispatch(BankStore.deleteOperation(operationId));
    },
    deleteAccessSession(accessId: number) {
        return BankStore.deleteAccessSession(accessId);
    },
    createAlert(dispatch: Dispatch, newAlert: Partial<Alert>) {
        return dispatch(BankStore.createAlert(newAlert));
    },
    updateAlert(dispatch: Dispatch, alertId: number, newFields: Partial<Alert>) {
        return dispatch(BankStore.updateAlert(alertId, newFields));
    },
    deleteAlert(dispatch: Dispatch, alertId: number) {
        return dispatch(BankStore.deleteAlert(alertId));
    },

    // *** Categories *********************************************************

    createCategory(dispatch: Dispatch, category: CategoryStore.CreateCategoryFields) {
        dispatch(BudgetStore.reset());
        return dispatch(CategoryStore.create(category));
    },
    createDefaultCategories(dispatch: Dispatch) {
        dispatch(BudgetStore.reset());
        return dispatch(CategoryStore.createDefault());
    },
    updateCategory(dispatch: Dispatch, former: Category, newer: Partial<Category>) {
        return dispatch(CategoryStore.update(former, newer));
    },
    deleteCategory(dispatch: Dispatch, formerId: number, replaceById: number) {
        // Reset the budgets so a new fetch will occur, ensuring everything is up-to-date
        dispatch(BudgetStore.reset());
        return dispatch(CategoryStore.destroy(formerId, replaceById));
    },

    // *** Budgets ************************************************************

    setBudgetsPeriod(dispatch: Dispatch, year: number, month: number) {
        return dispatch(BudgetStore.setSelectedPeriod(year, month));
    },
    fetchBudgetsByYearMonth(dispatch: Dispatch, year: number, month: number) {
        return dispatch(BudgetStore.fetchFromYearAndMonth(year, month));
    },
    updateBudget(dispatch: Dispatch, former: Budget, newer: BudgetStore.BudgetUpdateFields) {
        return dispatch(BudgetStore.update(former, newer));
    },

    // *** UI *****************************************************************

    setSearchFields(dispatch: Dispatch, map: Partial<UiStore.SearchFields>) {
        return dispatch(UiStore.setSearchFields(map));
    },
    resetSearch(dispatch: Dispatch) {
        return dispatch(UiStore.resetSearch());
    },
    toggleSearchDetails(dispatch: Dispatch, show?: boolean) {
        return dispatch(UiStore.toggleSearchDetails(show));
    },
    setIsSmallScreen(dispatch: Dispatch, isSmall: boolean) {
        return dispatch(UiStore.setIsSmallScreen(isSmall));
    },
    toggleMenu(dispatch: Dispatch, hideMenu?: boolean) {
        return dispatch(UiStore.toggleMenu(hideMenu));
    },
    finishUserAction(dispatch: Dispatch) {
        return dispatch(UiStore.finishUserAction());
    },

    // *** Instance ***********************************************************

    updateWeboob() {
        return InstanceStore.updateWeboob();
    },
    fetchWeboobVersion(dispatch: Dispatch) {
        return dispatch(InstanceStore.fetchWeboobVersion());
    },
    resetWeboobVersion(dispatch: Dispatch) {
        return dispatch(InstanceStore.resetWeboobVersion());
    },
    sendTestEmail(email: string) {
        return InstanceStore.sendTestEmail(email);
    },
    sendTestNotification(appriseUrl: string) {
        return InstanceStore.sendTestNotification(appriseUrl);
    },
    exportInstance(maybePassword?: string) {
        return InstanceStore.exportInstance(maybePassword);
    },
    fetchLogs() {
        return InstanceStore.fetchLogs();
    },
    clearLogs() {
        return InstanceStore.clearLogs();
    },

    // *** Settings ***********************************************************
    refreshPage() {
        window.location.reload(false);
    },
    setSetting(dispatch: Dispatch, key: string, value: string) {
        this.refreshPage();
        return dispatch(SettingsStore.set(key, value));
    },
    setBoolSetting(dispatch: Dispatch, key: string, value: boolean) {
        return this.setSetting(dispatch, key, value.toString());
    },
    setDarkMode(dispatch: Dispatch, enabled: boolean) {
        return dispatch(SettingsStore.set(DARK_MODE, enabled.toString()));
    },
    setFluidLayout(dispatch: Dispatch, enabled: boolean) {
        return dispatch(SettingsStore.set(FLUID_LAYOUT, enabled.toString()));
    },

    // *** Global app *********************************************************

    importInstance(dispatch: Dispatch, data: any, type: ImportType, maybePassword?: string) {
        return dispatch(importInstance(data, type, maybePassword));
    },
    enableDemoMode(dispatch: Dispatch) {
        return dispatch(enableDemo(true));
    },
    disableDemoMode(dispatch: Dispatch) {
        return dispatch(enableDemo(false));
    },
};

export async function init(): Promise<GlobalState> {
    const world: {
        settings: SettingsStore.KeyValue[];
        instance: Record<string, string | null>;
        categories: Category[];
        operations: Operation[];
        accounts: Account[];
        alerts: Alert[];
        accesses: Access[];
    } = await backend.init();

    const state: Partial<GlobalState> = {};

    // Settings need to be loaded first, because locale information depends
    // upon them.
    assertHas(world, 'settings');
    state.settings = SettingsStore.initialState(world.settings);

    assertHas(world, 'instance');
    state.instance = InstanceStore.initialState(world.instance);

    assertHas(world, 'categories');
    state.categories = CategoryStore.initialState(world.categories);

    // Define external values for the Bank initialState:
    const external = {
        defaultCurrency: SettingsStore.get(state.settings, DEFAULT_CURRENCY),
        defaultAccountId: SettingsStore.get(state.settings, DEFAULT_ACCOUNT_ID),
    };

    assertHas(world, 'accounts');
    assertHas(world, 'accesses');
    assertHas(world, 'operations');
    assertHas(world, 'alerts');

    state.banks = BankStore.initialState(
        external,
        world.accesses,
        world.accounts,
        world.operations,
        world.alerts
    );

    state.budgets = BudgetStore.initialState();

    // The UI must be computed at the end.
    state.ui = UiStore.initialState(
        get.boolSetting(state as GlobalState, DEMO_MODE),
        get.boolSetting(state as GlobalState, DARK_MODE),
        get.boolSetting(state as GlobalState, FLUID_LAYOUT)
    );

    return state as GlobalState;
}

// Global actions/reducers. All these actions lead to a full reset of the
// state, which is costly.

// Imports a whole instance.
function importInstance(data: any, type: ImportType, maybePassword?: string) {
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
function enableDemo(enabled: boolean) {
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
