import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SUCCESS, FAIL, Action, resetStoreReducer } from './helpers';

import {
    IMPORT_INSTANCE,
    CREATE_ACCESS,
    RUN_ACCOUNTS_SYNC,
    RUN_BALANCE_RESYNC,
    RUN_TRANSACTIONS_SYNC,
    RUN_APPLY_BULKEDIT,
    UPDATE_ACCESS_AND_FETCH,
    ENABLE_DEMO_MODE,
} from './actions';

import { assertDefined, computeIsSmallScreen, maybeReloadTheme } from '../helpers';
import { DARK_MODE, FLUID_LAYOUT } from '../../shared/settings';
import { AnyAction } from 'redux';
import { FinishUserAction } from './banks';
import { UserActionField } from '../../shared/types';
import * as SettingsStore from './settings';

// All the possible search fields.
// Note: update `setSearchFields` if you add a field here.
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

function setDarkMode(enabled: boolean) {
    if (typeof document !== 'undefined') {
        document.body.classList.toggle('dark', enabled);
        maybeReloadTheme(enabled ? 'dark' : 'light');
    }
}

function setFluidLayout(enabled: boolean) {
    if (typeof document !== 'undefined') {
        document.body.classList.toggle('fluid', enabled);
    }
}

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

export function makeInitialState(
    isDemoEnabled = false,
    enabledDarkMode = false,
    enabledFluidLayout = false
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

const uiSlice = createSlice({
    name: 'ui',
    initialState: makeInitialState(),
    reducers: {
        reset: resetStoreReducer<UiState>,

        // Requests the accomplishment of a user action to the user.
        requestUserAction(state, action: PayloadAction<Partial<UserActionRequested>>) {
            const { message, fields, finish } = action.payload;

            assertDefined(message);
            assertDefined(fields);
            assertDefined(finish);

            // Clear the processing reason, in case there was one. The finish()
            // action should reset it.
            state.processingReason = null;

            state.userActionRequested = {
                message,
                fields,
                finish,
            };
        },

        finishUserAction(state) {
            state.userActionRequested = null;
        },

        // Opens or closes the search details window.
        toggleSearchDetails(state, action: PayloadAction<boolean | undefined>) {
            const showOrUndefined = action.payload;
            state.displaySearchDetails =
                typeof showOrUndefined === 'undefined'
                    ? !getDisplaySearchDetails(state)
                    : showOrUndefined;
        },

        // Opens or closes the (left) menu.
        toggleMenu(state, action: PayloadAction<boolean | undefined>) {
            const hideOrUndefined = action.payload;
            state.isMenuHidden =
                typeof hideOrUndefined === 'undefined' ? !isMenuHidden(state) : hideOrUndefined;
        },

        // Sets a group of search fields.
        setSearchFields(state, action: PayloadAction<Partial<SearchFields>>) {
            state.search = { ...state.search, ...action.payload };
        },

        // Defines that the app is now running in small screen mode.
        setIsSmallScreen(state, action: PayloadAction<boolean>) {
            state.isSmallScreen = action.payload;
        },

        // Clears all the search fields
        resetSearch(state) {
            state.search = initialSearch();
        },
    },
    extraReducers: builder => {
        // TODO: use a matcher based on PayloadAction and isFulfilled/isRejected etc. once ReduxToolKit is
        // used everywhere.
        builder
            .addCase(CREATE_ACCESS, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.fetch_account';
            })
            .addCase(IMPORT_INSTANCE, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.import';
            })
            .addCase(RUN_ACCOUNTS_SYNC, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.sync';
            })
            .addCase(RUN_APPLY_BULKEDIT, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.apply';
            })
            .addCase(RUN_BALANCE_RESYNC, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.balance_resync';
            })
            .addCase(RUN_TRANSACTIONS_SYNC, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.sync';
            })
            .addCase(UPDATE_ACCESS_AND_FETCH, (state, action: Action<undefined>) => {
                const { status } = action;
                state.processingReason =
                    status === FAIL || status === SUCCESS ? null : 'client.spinner.fetch_account';
            })
            .addCase(ENABLE_DEMO_MODE, (state, action: AnyAction) => {
                const msg = action.enabled ? 'client.demo.enabling' : 'client.demo.disabling';
                const { status } = action;
                state.processingReason = status === FAIL || status === SUCCESS ? null : msg;
                state.isDemoMode = action.enabled;
            });

        builder.addCase(SettingsStore.setPair.fulfilled, (_state, action) => {
            const { key, value } = action.payload;
            switch (key) {
                case DARK_MODE: {
                    const enabled = typeof value === 'boolean' ? value : value === 'true';
                    setDarkMode(enabled);
                    break;
                }
                case FLUID_LAYOUT: {
                    const enabled = typeof value === 'boolean' ? value : value === 'true';
                    setFluidLayout(enabled);
                    break;
                }
                default:
                    break;
            }
        });
    },
});

export const name = uiSlice.name;

export const actions = uiSlice.actions;

export const reducer = uiSlice.reducer;

export const {
    toggleSearchDetails,
    toggleMenu,
    setSearchFields,
    setIsSmallScreen,
    resetSearch,
    requestUserAction,
    finishUserAction,
} = uiSlice.actions;

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
