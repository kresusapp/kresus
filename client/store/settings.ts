import { produce } from 'immer';
import { Dispatch } from 'redux';

import DefaultSettings from '../../shared/default-settings';
import { assert, assertDefined, setupTranslator } from '../helpers';
import { DARK_MODE, LOCALE } from '../../shared/settings';

import * as backend from './backend';
import {
    Action,
    actionStatus,
    createActionCreator,
    createReducerFromMap,
    SUCCESS,
} from './new-helpers';

import { SET_SETTING } from './actions';

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

type KeyValue = { key: string; value: string };

function getLocalSettings() {
    const emptyArray: KeyValue[] = [];

    if (window && window.localStorage) {
        // Filter settings without local values (getItem will return null if there is no stored
        // value for a given key).
        return localSettings.reduce((acc, s) => {
            let value = window.localStorage.getItem(s);

            // If there is no user-defined value for this setting, try to compute one from
            // the browser preferences.
            if (value === null && s in browserSettingsGuesser) {
                value = browserSettingsGuesser[s]();
            }

            if (value !== null) {
                acc.push({ key: s, value });
            }
            return acc;
        }, emptyArray);
    }
    return emptyArray;
}

type SettingsState = {
    map: Record<string, string>;
};

export function set(key: string, value: string) {
    assert(key.length + value.length > 0, 'key and value must be non-empty');

    return async (dispatch: Dispatch) => {
        const action = actionSetSetting({ key, value });
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

type SetSettingActionParams = KeyValue;
const actionSetSetting = createActionCreator<SetSettingActionParams>(SET_SETTING);

// Reducers
function reduceSet(state: SettingsState, action: Action<SetSettingActionParams>): SettingsState {
    if (action.status === SUCCESS) {
        const { key, value } = action;

        if (key === LOCALE) {
            setupTranslator(value);
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
export function initialState(settings: KeyValue[]): SettingsState {
    const map: Record<string, string> = {};
    const allSettings = settings.concat(getLocalSettings());

    for (const pair of allSettings) {
        assert(
            DefaultSettings.has(pair.key),
            `all settings must have their default value, missing for: ${pair.key}`
        );
        map[pair.key] = pair.value;
    }

    assertDefined(map.locale, 'Kresus needs a locale');

    setupTranslator(map.locale);

    return { map };
}

// Getters
export function get(state: SettingsState, key: string): string {
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
