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

import { Account, Category, Transaction, Access, Alert, Setting } from '../models';

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

export async function init(): Promise<any> {
    const world: {
        settings: Setting[];
        instance: Record<string, string | null>;
        categories: Category[];
        transactions: Transaction[];
        accounts: Account[];
        alerts: Alert[];
        accesses: Access[];
    } = await backend.init();

    assertHas(world, 'settings');
    assertHas(world, 'categories');
    assertHas(world, 'accounts');
    assertHas(world, 'accesses');
    assertHas(world, 'transactions');
    assertHas(world, 'alerts');

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

    return {
        settings: settingsPropertiesMap,

        instance: world.instance,

        categories: world.categories,

        banks: {
            external: {
                defaultCurrency: SettingsStore.get(initialSettingsState, DEFAULT_CURRENCY),
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
        },

        rules: RulesStore.initialState,

        budgets: BudgetStore.initialState,

        ui: {
            isDemoEnabled: SettingsStore.getBool(initialSettingsState, DEMO_MODE),
            enabledDarkMode: SettingsStore.getBool(initialSettingsState, DARK_MODE),
            enabledFluidLayout: SettingsStore.getBool(initialSettingsState, FLUID_LAYOUT),
        },
    };
}
