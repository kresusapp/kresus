import u from 'updeep';

import { has, assert, debug, setupTranslator, translate as $t } from '../helpers';

import { createReducerFromMap, makeStatusHandlers, SUCCESS, FAIL } from './helpers';

const uiState = u({
    currentBankId: null,
    currentAccountId: null
});

// Actions
const SET_BANK_ID = "SET_BANK_ID";
const SET_ACCOUNT_ID = "SET_ACCOUNT_ID";

// Basic action creators
const basic = {

    setBankId(id) {
        return {
            type: SET_BANK_ID,
            id
        }
    },

    setAccountId(id) {
        return {
            type: SET_ACCOUNT_ID,
            id
        }
    },

};

export function setCurrentBankId(bankId) {
    return basic.setBankId(bankId);
}
export function setCurrentAccountId(accountId) {
    return basic.setAccountId(accountId);
}

// Reducers
function reduceSetCurrentBankId(state, action) {
    let { id } = action;
    return u({
        currentBankId: id
    }, state);
}

function reduceSetCurrentAccountId(state, action) {
    let { id } = action;
    return u({
        currentAccountId: id
    }, state);
}

const reducers = {
    SET_BANK_ID: reduceSetCurrentBankId,
    SET_ACCOUNT_ID: reduceSetCurrentAccountId,
};

export let reducer = createReducerFromMap(uiState, reducers);

// Initial state
export function initialState(store) {

    let currentAccountId = null;
    let currentBankId = null;

    let defaultAccountId = store.getDefaultAccountId();

    let allBanks = store.getBanks();

    out:
    for (let bank of allBanks) {
        for (let account of store.getBankAccounts(bank.uuid)) {

            if (account.id === defaultAccountId) {
                currentAccountId = account.id;
                currentBankId = bank.id;
                break out;
            }

            if (!currentAccountId) {
                currentAccountId = account.id;
                currentBankId = bank.id;
            }
        }
    }

    return u({
        currentBankId,
        currentAccountId
    }, {});
}

// Getters
export function getCurrentBankId(state) {
    return state.currentBankId;
}

export function getCurrentAccountId(state) {
    return state.currentAccountId;
}
