import { createAsyncThunk } from '@reduxjs/toolkit';

import { assertHas } from '../helpers';

import {
    DARK_MODE,
    DEFAULT_ACCOUNT_ID,
    DEFAULT_CURRENCY,
    DEMO_MODE,
    FLUID_LAYOUT,
    LIMIT_ONGOING_TO_CURRENT_MONTH,
} from '../../shared/settings';

import {
    Account,
    Category,
    Transaction,
    Access,
    Alert,
    Setting,
    RecurringTransaction,
    View,
    User,
} from '../models';

import * as backend from './backend';

import * as BudgetStore from './budgets';
import * as RulesStore from './rules';
import * as SettingsStore from './settings';

type ImportType = 'ofx' | 'json';

// Global actions/reducers. All these actions lead to a full reset of the
// state, which is costly.

// Imports a whole instance.
export const importInstance = createAsyncThunk(
    'global/importInstance',
    async (params: { data: any; type: ImportType; maybePassword?: string }) => {
        const importBackend = params.type === 'ofx' ? backend.importOFX : backend.importInstance;
        await importBackend(params.data, params.maybePassword);
        const state = await init();
        return state;
    }
);

// Enables the demo mode.
export const enableDemo = createAsyncThunk('global/enableDemo', async (enabled: boolean) => {
    if (enabled) {
        await backend.enableDemoMode();
    } else {
        await backend.disableDemoMode();
    }

    const state = await init();
    return state;
});

type ServerView = Omit<View, 'accounts'> & {
    accounts: {
        accountId: number;
    }[];
};

// The user is not expected to change, no need for a store.
let currentUser: User | null = null;
export const getCurrentUser = () => currentUser;

export async function init(): Promise<any> {
    const world: {
        settings: Setting[];
        instance: Record<string, string | null>;
        categories: Category[];
        transactions: Transaction[];
        accounts: Account[];
        alerts: Alert[];
        accesses: Access[];
        recurringTransactions: RecurringTransaction[];
        views: ServerView[];
        user: User;
    } = await backend.init();

    assertHas(world, 'settings');
    assertHas(world, 'categories');
    assertHas(world, 'accounts');
    assertHas(world, 'accesses');
    assertHas(world, 'transactions');
    assertHas(world, 'alerts');
    assertHas(world, 'recurringTransactions');
    assertHas(world, 'views');
    assertHas(world, 'user');

    currentUser = world.user;

    // We cannot just use the world.settings value because Settings will return a
    // default value if an entry is not defined in `world.settings`.
    const settingsPropertiesMap: SettingsStore.SettingsMap = {};
    const allSettings = world.settings.concat(SettingsStore.getLocalSettings());
    for (const pair of allSettings) {
        settingsPropertiesMap[pair.key] = pair.value;
    }

    const initialSettingsState = {
        map: settingsPropertiesMap,
    };

    const defaultCurrency = SettingsStore.get(initialSettingsState, DEFAULT_CURRENCY);

    const views = world.views.map(view => ({
        ...view,
        type: 'id',
        accounts: view.accounts.map(acc => acc.accountId),
    }));

    // For each account currency, automatically create a view.
    const accountCurrencies = new Map<string, number[]>();
    for (const account of world.accounts) {
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

    return {
        settings: settingsPropertiesMap,

        instance: world.instance,

        categories: world.categories,

        banks: {
            external: {
                defaultCurrency,
                defaultAccountId: SettingsStore.get(initialSettingsState, DEFAULT_ACCOUNT_ID),
                isOngoingLimitedToCurrentMonth: SettingsStore.getBool(
                    initialSettingsState,
                    LIMIT_ONGOING_TO_CURRENT_MONTH
                ),
            },
            accesses: world.accesses,
            accounts: world.accounts,
            transactions: world.transactions,
            alerts: world.alerts,
            recurringTransactions: world.recurringTransactions,
        },

        rules: RulesStore.initialState,

        budgets: BudgetStore.initialState,

        views,

        ui: {
            isDemoEnabled: SettingsStore.getBool(initialSettingsState, DEMO_MODE),
            enabledDarkMode: SettingsStore.getBool(initialSettingsState, DARK_MODE),
            enabledFluidLayout: SettingsStore.getBool(initialSettingsState, FLUID_LAYOUT),
        },
    };
}
