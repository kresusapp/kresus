import { produce } from 'immer';
import { Dispatch } from 'redux';

import DefaultSettings from '../../shared/default-settings';
import { assert, assertDefined, setupTranslator, maybeReloadTheme } from '../helpers';
import { DARK_MODE, LOCALE } from '../../shared/settings';

import * as backend from './backend';
import {
    Action,
    actionStatus,
    createActionCreator,
    createReducerFromMap,
    SUCCESS,
} from './helpers';

import { SET_SETTING } from './actions';

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

export type KeyValue = { key: string; value: string };

function getLocalSettings(): KeyValue[] {
    if (!window || !window.localStorage) {
        return [];
    }

    // Filter settings without local values (getItem will return null if there is no stored
    // value for a given key).
    const ret: KeyValue[] = [];
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

export function set(key: string, value: string) {
    assert(key.length + value.length > 0, 'key and value must be non-empty');

    return async (dispatch: Dispatch) => {
        const action = setSettingAction({ key, value });
        dispatch(action);
        try {
            if (localSettings.includes(key)) {
                window.localStorage.setItem(key, value);
            } else {
                await backend.saveSetting(key, value);
            }
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

export function setBool(key: string, value: boolean) {
    return set(key, value.toString());
}

const setSettingAction = createActionCreator<KeyValue>(SET_SETTING);

function reduceSet(state: SettingState, action: Action<KeyValue>): SettingState {
    if (action.status === SUCCESS) {
        const { key, value } = action;
        if (key === LOCALE) {
            setupTranslator(value);
        }
        if (key === DARK_MODE) {
            maybeReloadTheme(value === 'true' ? 'dark' : 'light');
        }
        return produce(state, draft => {
            draft.map[key] = value;
        });
    }
    return state;
}

const reducers = {
    [SET_SETTING]: reduceSet,
};

export const reducer = createReducerFromMap(reducers);

// Initial state
export function initialState(settings: KeyValue[]): SettingState {
    const allSettings = settings.concat(getLocalSettings());

    const map: Record<string, string> = {};
    for (const pair of allSettings) {
        assert(
            DefaultSettings.has(pair.key),
            `all settings must have their default value, missing for: ${pair.key}`
        );
        map[pair.key] = pair.value;
    }

    assertDefined(map.locale, 'Kresus needs a locale');
    setupTranslator(map.locale);
    maybeReloadTheme(map[DARK_MODE] === 'true' ? 'dark' : 'light');

    return { map };
}

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
