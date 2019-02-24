import u from 'updeep';

import { assert, assertHas } from '../helpers';

import { Budget } from '../models';

import * as backend from './backend';

import { createReducerFromMap, fillOutcomeHandlers, SUCCESS, FAIL, updateMapIf } from './helpers';

import { SET_BUDGETS_PERIOD, FETCH_BUDGETS, UPDATE_BUDGET, RESET_BUDGETS } from './actions';

import { genericErrorHandler } from '../errors';

// Basic actions creators
const basic = {
    setPeriod(year, month) {
        return {
            type: SET_BUDGETS_PERIOD,
            year,
            month
        };
    },

    fetchBudgets(budgets) {
        return {
            type: FETCH_BUDGETS,
            budgets: budgets.budgets,
            year: budgets.year,
            month: budgets.month
        };
    },

    updateBudget(former, budget) {
        return {
            type: UPDATE_BUDGET,
            former,
            budget
        };
    },

    resetBudgets() {
        return {
            type: RESET_BUDGETS
        };
    }
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

export function update(former, budget) {
    assert(former instanceof Budget, 'UpdateBudget first arg must be a Budget');
    assertHas(budget, 'year', 'UpdateBudget second arg must have a year field');
    assertHas(budget, 'month', 'UpdateBudget second arg must have a month field');
    assert(
        typeof budget.threshold === 'number',
        'threshold',
        'UpdateBudget second arg must have a threshold field'
    );
    assertHas(budget, 'categoryId', 'UpdateBudget second arg must have a categoryId field');

    return dispatch => {
        dispatch(basic.updateBudget(former, budget));
        backend
            .updateBudget(budget)
            .then(() => {
                dispatch(success.updateBudget(former, budget));
            })
            .catch(err => {
                dispatch(fail.updateBudget(err, former, budget));
            });
    };
}

// States
let currentDate = new Date();
const budgetState = u(
    {
        // The budgets themselves.
        budgetsByPeriod: {},

        // The selected year
        year: currentDate.getFullYear(),

        // The selected month
        month: currentDate.getMonth()
    },
    {}
);

// Reducers
function reduceSetPeriod(state, action) {
    return u(
        {
            year: action.year,
            month: action.month
        },
        state
    );
}

function reduceFetch(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        return u(
            {
                budgetsByPeriod: {
                    [`${action.year}${action.month}`]: action.budgets.map(b => new Budget(b))
                }
            },
            state
        );
    }

    if (status === FAIL) {
        genericErrorHandler(action.error);
        return u(
            {
                budgetsByPeriod: {
                    [`${action.year}${action.month}`]: null
                }
            },
            state
        );
    }

    return state;
}

function reduceUpdate(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let updated = action.budget;

        return u(
            {
                budgetsByPeriod: {
                    [`${updated.year}${updated.month}`]: updateMapIf(
                        'categoryId',
                        updated.categoryId,
                        budget => new Budget(u(updated, budget))
                    )
                }
            },
            state
        );
    }

    if (status === FAIL) {
        genericErrorHandler(action.error);
    }

    return state;
}

function reduceReset(state) {
    return u(
        {
            budgetsByPeriod: u.constant({})
        },
        state
    );
}

const reducers = {
    SET_BUDGETS_PERIOD: reduceSetPeriod,
    FETCH_BUDGETS: reduceFetch,
    UPDATE_BUDGET: reduceUpdate,
    RESET_BUDGETS: reduceReset
};

export const reducer = createReducerFromMap(budgetState, reducers);

// Initial state
export function initialState() {
    return u(
        {
            budgetsByPeriod: {}
        },
        {}
    );
}

export function getSelectedPeriod(state) {
    return { year: state.year, month: state.month };
}

export function fromSelectedPeriod(state) {
    return state.budgetsByPeriod[`${state.year}${state.month}`] || null;
}

function _fetchFromYearAndMonth(dispatch, year, month) {
    backend
        .fetchBudgets(year, month)
        .then(result => {
            dispatch(success.fetchBudgets(result));
        })
        .catch(err => {
            dispatch(fail.fetchBudgets(err));
        });
}

export function setSelectedPeriod(year, month) {
    return (dispatch, getState) => {
        dispatch(basic.setPeriod(year, month));

        if (!fromSelectedPeriod(getState().budgets)) {
            _fetchFromYearAndMonth(dispatch, year, month);
        }
    };
}

export function fetchFromYearAndMonth(year, month) {
    return dispatch => _fetchFromYearAndMonth(dispatch, year, month);
}

export function reset() {
    return dispatch => dispatch(basic.resetBudgets());
}
