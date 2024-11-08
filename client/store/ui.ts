import { createSlice, PayloadAction, isAnyOf } from '@reduxjs/toolkit';

import { assertDefined, computeIsSmallScreen, maybeReloadTheme } from '../helpers';
import { DARK_MODE, FLUID_LAYOUT } from '../../shared/settings';
import { FinishUserAction } from './banks';
import { UserActionField } from '../../shared/types';
import * as SettingsStore from './settings';
import * as BanksStore from './banks';
import * as GlobalStore from './global';

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
    processingReason: string | null;
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

function makeInitialState(
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
        reset(_state, action) {
            // This is meant to be used as a redux toolkit reducer, using immutable under the hood.
            // Returning a value here will overwrite the state.
            const { isDemoEnabled, enabledDarkMode, enabledFluidLayout } = action.payload;
            return makeInitialState(isDemoEnabled, enabledDarkMode, enabledFluidLayout);
        },

        // Requests the accomplishment of a user action to the user.
        requestUserAction(state, action: PayloadAction<Partial<UserActionRequested>>) {
            const { message, fields, finish } = action.payload;

            assertDefined(message);
            assertDefined(fields);
            assertDefined(finish);

            state.userActionRequested = {
                message,
                fields,
                finish,
                processingReason: state.processingReason,
            };

            // Clear the processing reason for now, will be reset later.
            state.processingReason = null;
        },

        finishUserAction(state) {
            // Reset the processing reason.
            if (state.userActionRequested) {
                state.processingReason = state.userActionRequested.processingReason;
            }

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
        builder
            .addCase(GlobalStore.importInstance.pending, state => {
                state.processingReason = 'client.spinner.import';
            })
            .addCase(GlobalStore.enableDemo.pending, (state, action) => {
                state.processingReason = `client.demo.${
                    action.meta.arg ? 'enabling' : 'disabling'
                }`;
            })
            .addCase(GlobalStore.enableDemo.fulfilled, (state, action) => {
                state.isDemoMode = action.payload;
            })
            .addCase(SettingsStore.setPair.fulfilled, (_state, action) => {
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
            })
            .addCase(BanksStore.applyBulkEdit.pending, state => {
                state.processingReason = 'client.spinner.apply';
            })
            .addMatcher(
                isAnyOf(BanksStore.runAccountsSync.pending, BanksStore.runTransactionsSync.pending),
                state => {
                    state.processingReason = 'client.spinner.sync';
                }
            )
            .addMatcher(
                isAnyOf(BanksStore.createAccess.pending, BanksStore.updateAndFetchAccess.pending),
                state => {
                    state.processingReason = 'client.spinner.fetch_account';
                }
            )
            .addMatcher(
                isAnyOf(
                    BanksStore.createAccess.rejected,
                    BanksStore.createAccess.fulfilled,

                    BanksStore.runAccountsSync.fulfilled,
                    BanksStore.runAccountsSync.rejected,

                    BanksStore.applyBulkEdit.fulfilled,
                    BanksStore.applyBulkEdit.rejected,

                    BanksStore.runTransactionsSync.fulfilled,
                    BanksStore.runTransactionsSync.rejected,

                    BanksStore.updateAndFetchAccess.fulfilled,
                    BanksStore.updateAndFetchAccess.rejected,

                    GlobalStore.importInstance.rejected,
                    GlobalStore.importInstance.fulfilled,

                    GlobalStore.enableDemo.rejected,
                    GlobalStore.enableDemo.fulfilled
                ),
                state => {
                    state.processingReason = null;
                }
            );
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
