import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import DefaultSettings from '../../shared/default-settings';
import { assert, assertDefined, setupTranslator } from '../helpers';
import { Setting } from '../models';
import { DARK_MODE, LOCALE } from '../../shared/settings';

import * as backend from './backend';

export type SettingState = {
    map: Record<string, string>;
};

/* Those settings are stored in the browser local storage only. */
const localSettings: string[] = [DARK_MODE];

const browserSettingsGuesser: Record<string, () => string | null> = {
    [DARK_MODE]: () => {
        if (window && 'matchMedia' in window) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches.toString();
        }

        return null;
    },
};

export function getLocalSettings(): Setting[] {
    if (typeof window === 'undefined' || !window.localStorage) {
        return [];
    }

    // Filter settings without local values (getItem will return null if there is no stored
    // value for a given key).
    const ret: Setting[] = [];
    for (const s of localSettings) {
        let value = window.localStorage.getItem(s);

        // If there is no user-defined value for this setting, try to compute one from
        // the browser preferences.
        if (value === null && s in browserSettingsGuesser) {
            value = browserSettingsGuesser[s]();
        }

        if (value !== null) {
            ret.push({ key: s, value });
        }
    }
    return ret;
}

export type SettingsMap = Record<string, string>;

// Initial state
function makeInitialState(map: SettingsMap): SettingState {
    for (const pairKey in map) {
        if (map.hasOwnProperty(pairKey)) {
            assert(
                DefaultSettings.has(pairKey),
                `all settings must have their default value, missing for: ${pairKey}`
            );
        }
    }

    assertDefined(map.locale, 'Kresus needs a locale');
    setupTranslator(map.locale);

    return { map };
}

export const setPair = createAsyncThunk('settings/set', async (setting: Setting) => {
    const { key, value } = setting;
    assert(key.length + value.length > 0, 'key and value must be non-empty');

    if (localSettings.includes(setting.key)) {
        window.localStorage.setItem(setting.key, setting.value);
    } else {
        await backend.saveSetting(key, setting.value);
    }

    return setting;
});

const settingsSlice = createSlice({
    name: 'settings',
    initialState: makeInitialState({ locale: 'en' }),
    reducers: {
        reset(_state, action) {
            // This is meant to be used as a redux toolkit reducer, using immutable under the hood.
            // Returning a value here will overwrite the state.
            return makeInitialState(action.payload);
        },
    },
    extraReducers: builder => {
        builder.addCase(setPair.fulfilled, (state, action) => {
            const { key, value } = action.payload;
            if (key === LOCALE) {
                setupTranslator(value);
            }
            state.map[key] = value;
        });
    },
});

export const name = settingsSlice.name;

export const actions = settingsSlice.actions;

export const reducer = settingsSlice.reducer;

// Getters
export function get(state: SettingState, key: string): string {
    if (typeof state.map[key] !== 'undefined') {
        return state.map[key];
    }

    const defaultSetting = DefaultSettings.get(key);
    assertDefined(
        defaultSetting,
        `all settings must have default values, but ${key} doesn't have one.`
    );
    return defaultSetting;
}

export function getBool(state: SettingState, key: string) {
    const val = get(state, key);
    assert(val === 'true' || val === 'false', 'A bool setting must be true or false');
    return val === 'true';
}

// Setters
export function set(key: string, value: string) {
    return setPair({ key, value });
}

export function setBool(key: string, value: boolean) {
    return setPair({ key, value: value.toString() });
}
