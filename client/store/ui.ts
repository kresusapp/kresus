import {
    createReducerFromMap,
    SUCCESS,
    FAIL,
    Action,
    createActionCreator,
    actionStatus,
} from './helpers';

import {
    SET_IS_SMALL_SCREEN,
    SET_SEARCH_FIELDS,
    RESET_SEARCH,
    TOGGLE_SEARCH_DETAILS,
    TOGGLE_MENU,
    REQUEST_USER_ACTION,
    IMPORT_INSTANCE,
    CREATE_ACCESS,
    RUN_ACCOUNTS_SYNC,
    RUN_BALANCE_RESYNC,
    RUN_TRANSACTIONS_SYNC,
    RUN_APPLY_BULKEDIT,
    UPDATE_ACCESS_AND_FETCH,
    ENABLE_DEMO_MODE,
    SET_SETTING,
} from './actions';

import { assertDefined, computeIsSmallScreen } from '../helpers';
import { DARK_MODE, FLUID_LAYOUT } from '../../shared/settings';
import { produce } from 'immer';
import { AnyAction } from 'redux';
import { FinishUserAction } from './banks';
import { UserActionField } from '../../shared/types';
import { KeyValue } from './settings';
import { EnableDemoParams } from '.';

// All the possible search fields.
// Note: update `reduceSetSearchField` if you add a field here.
export type SearchFields = {
    keywords: string[];
    categoryIds: number[];
    type: string;
    amountLow: number | null;
    amountHigh: number | null;
    dateLow: Date | null;
    dateHigh: Date | null;
};

export type UserActionRequested = {
    message: string | null;
    fields: UserActionField[] | null;
    finish: FinishUserAction;
};

export type UiState = {
    search: SearchFields;
    displaySearchDetails: boolean;
    isSmallScreen: boolean;
    isMenuHidden: boolean;
    isDemoMode: boolean;
    processingReason: string | null;
    userActionRequested: UserActionRequested | null;
};

// Sets a group of search fields.
export function setSearchFields(map: Partial<SearchFields>) {
    return setSearchFieldsAction({ map });
}

type SetSearchFieldsParams = { map: Partial<SearchFields> };
const setSearchFieldsAction = createActionCreator<SetSearchFieldsParams>(SET_SEARCH_FIELDS);

function reduceSetSearchFields(state: UiState, action: Action<SetSearchFieldsParams>) {
    const { map } = action;
    return produce(state, draft => {
        draft.search = { ...draft.search, ...map };
        return draft;
    });
}

// Clears all the search fields
export function resetSearch() {
    return resetSearchAction();
}

const resetSearchAction = createActionCreator<void>(RESET_SEARCH);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reduceResetSearch(state: UiState, _action: Action<void>) {
    return produce(state, draft => {
        draft.search = initialSearch();
        return draft;
    });
}

// Opens or closes the search details window.
export function toggleSearchDetails(show: boolean | undefined) {
    return toggleSearchDetailsAction({ show });
}

type ToggleSearchDetailsParams = { show?: boolean };
const toggleSearchDetailsAction =
    createActionCreator<ToggleSearchDetailsParams>(TOGGLE_SEARCH_DETAILS);

function reduceToggleSearchDetails(state: UiState, action: Action<ToggleSearchDetailsParams>) {
    const { show: showOrUndefined } = action;
    const show =
        typeof showOrUndefined === 'undefined' ? !getDisplaySearchDetails(state) : showOrUndefined;
    return produce(state, draft => {
        draft.displaySearchDetails = show;
        return draft;
    });
}

// Defines that the app is now running in small screen mode.
export function setIsSmallScreen(isSmall: boolean) {
    return setIsSmallScreenAction({ isSmall });
}

type SetIsSmallScreenParams = { isSmall: boolean };
const setIsSmallScreenAction = createActionCreator<SetIsSmallScreenParams>(SET_IS_SMALL_SCREEN);

function reduceSetIsSmallScreen(state: UiState, action: Action<SetIsSmallScreenParams>) {
    const { isSmall } = action;
    return produce(state, draft => {
        draft.isSmallScreen = isSmall;
        return draft;
    });
}

// Opens or closes the (left) menu.
export function toggleMenu(hide: boolean | undefined) {
    return toggleMenuAction({ hide });
}

type ToggleMenuParams = { hide?: boolean };
const toggleMenuAction = createActionCreator<ToggleMenuParams>(TOGGLE_MENU);

function reduceToggleMenu(state: UiState, action: Action<ToggleMenuParams>) {
    const { hide: hideOrUndefined } = action;
    const hide = typeof hideOrUndefined === 'undefined' ? !isMenuHidden(state) : hideOrUndefined;
    return produce(state, draft => {
        draft.isMenuHidden = hide;
        return draft;
    });
}

// Requests the accomplishment of a user action to the user.
export function requestUserAction(
    finish: FinishUserAction,
    message: string | null,
    fields: UserActionField[] | null
) {
    return requestUserActionAction({ finish, message, fields });
}
export function finishUserAction() {
    return actionStatus.ok(requestUserActionAction({}));
}

type RequestUserActionParams = {
    finish?: FinishUserAction;
    message?: string | null;
    fields?: UserActionField[] | null;
};
const requestUserActionAction = createActionCreator<RequestUserActionParams>(REQUEST_USER_ACTION);

function reduceUserAction(state: UiState, action: Action<RequestUserActionParams>) {
    return produce(state, draft => {
        if (action.status === SUCCESS) {
            draft.userActionRequested = null;
            return draft;
        }

        assertDefined(action.message);
        assertDefined(action.fields);
        assertDefined(action.finish);

        // Clear the processing reason, in case there was one. The finish()
        // action should reset it.
        draft.processingReason = null;

        draft.userActionRequested = {
            message: action.message,
            fields: action.fields,
            finish: action.finish,
        };

        return draft;
    });
}

// Generates the reducer to display or not the spinner.
function showSpinnerWithReason(processingReason: string) {
    return (state: UiState, action: AnyAction) => {
        const { status } = action;
        return produce(state, draft => {
            draft.processingReason =
                status === FAIL || status === SUCCESS ? null : processingReason;
            return draft;
        });
    };
}

function setDarkMode(enabled: boolean) {
    document.body.classList.toggle('dark', enabled);
}

function setFluidLayout(enabled: boolean) {
    document.body.classList.toggle('fluid', enabled);
}

// External reducers.

function reduceSetSetting(state: UiState, action: Action<KeyValue>) {
    switch (action.key) {
        case DARK_MODE: {
            const enabled =
                typeof action.value === 'boolean' ? action.value : action.value === 'true';
            setDarkMode(enabled);
            break;
        }
        case FLUID_LAYOUT: {
            const enabled =
                typeof action.value === 'boolean' ? action.value : action.value === 'true';
            setFluidLayout(enabled);
            break;
        }
        default:
            break;
    }
    return state;
}

function reduceEnableDemo(state: UiState, action: Action<EnableDemoParams>): UiState {
    const msg = action.enabled ? 'client.demo.enabling' : 'client.demo.disabling';
    return showSpinnerWithReason(msg)(state, action);
}

const reducers = {
    // Own reducers.
    [REQUEST_USER_ACTION]: reduceUserAction,
    [RESET_SEARCH]: reduceResetSearch,
    [SET_IS_SMALL_SCREEN]: reduceSetIsSmallScreen,
    [SET_SEARCH_FIELDS]: reduceSetSearchFields,
    [TOGGLE_MENU]: reduceToggleMenu,
    [TOGGLE_SEARCH_DETAILS]: reduceToggleSearchDetails,

    // External actions.
    [SET_SETTING]: reduceSetSetting,
    [ENABLE_DEMO_MODE]: reduceEnableDemo,

    // Processing reasons reducers.
    [CREATE_ACCESS]: showSpinnerWithReason('client.spinner.fetch_account'),
    [IMPORT_INSTANCE]: showSpinnerWithReason('client.spinner.import'),
    [RUN_ACCOUNTS_SYNC]: showSpinnerWithReason('client.spinner.sync'),
    [RUN_APPLY_BULKEDIT]: showSpinnerWithReason('client.spinner.apply'),
    [RUN_BALANCE_RESYNC]: showSpinnerWithReason('client.spinner.balance_resync'),
    [RUN_TRANSACTIONS_SYNC]: showSpinnerWithReason('client.spinner.sync'),
    [UPDATE_ACCESS_AND_FETCH]: showSpinnerWithReason('client.spinner.fetch_account'),
};

export const reducer = createReducerFromMap(reducers);

// Initial state.
function initialSearch(): SearchFields {
    // Keep in sync with hasSearchFields.
    return {
        keywords: [],
        categoryIds: [],
        type: '',
        amountLow: null,
        amountHigh: null,
        dateLow: null,
        dateHigh: null,
    };
}

export function initialState(
    isDemoEnabled: boolean,
    enabledDarkMode: boolean,
    enabledFluidLayout: boolean
): UiState {
    const search = initialSearch();

    setDarkMode(enabledDarkMode);
    setFluidLayout(enabledFluidLayout);

    return {
        search,
        displaySearchDetails: false,
        processingReason: null,
        userActionRequested: null,
        isDemoMode: isDemoEnabled,
        isSmallScreen: computeIsSmallScreen(),
        isMenuHidden: computeIsSmallScreen(),
    };
}

// Getters.
export function getSearchFields(state: UiState): SearchFields {
    return state.search;
}
export function hasSearchFields(state: UiState): boolean {
    // Keep in sync with initialSearch();
    const { search } = state;
    return (
        search.keywords.length > 0 ||
        search.categoryIds.length > 0 ||
        search.type !== '' ||
        search.amountLow !== null ||
        search.amountHigh !== null ||
        search.dateLow !== null ||
        search.dateHigh !== null
    );
}

export function getDisplaySearchDetails(state: UiState): boolean {
    return state.displaySearchDetails;
}
export function getProcessingReason(state: UiState): string | null {
    return state.processingReason;
}
export function isSmallScreen(state: UiState): boolean {
    return state.isSmallScreen;
}
export function isMenuHidden(state: UiState): boolean {
    return state.isMenuHidden;
}
export function isDemoMode(state: UiState): boolean {
    return state.isDemoMode;
}

export function userActionRequested(state: UiState): UserActionRequested | null {
    return state.userActionRequested;
}
