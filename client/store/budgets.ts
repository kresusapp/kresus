import { produce } from 'immer';
import { Dispatch } from 'redux';

import { Budget } from '../models';

import * as backend from './backend';

import {
    actionStatus,
    createActionCreator,
    createReducerFromMap,
    Action,
    SUCCESS,
} from './helpers';

import { SET_BUDGETS_PERIOD, FETCH_BUDGETS, UPDATE_BUDGET, RESET_BUDGETS } from './actions';
import { assertDefined } from '../helpers';
import { GetStateType } from '.';

// State structure.
export interface BudgetState {
    // The selected year.
    year: number;

    // The selected month.
    month: number;

    // The budgets themselves.
    budgets: Record<string, Budget[]>;
}

// A helper to generate the key used to store budgets in the state.
function makeKey(year: number, month: number): string {
    return `${year}-${month}`;
}

export interface BudgetUpdateFields {
    year: number;
    month: number;
    threshold: number | null;
    categoryId: number;
}

// Updates a given budget item.
export function update(former: Budget, budget: BudgetUpdateFields) {
    return async (dispatch: Dispatch): Promise<void> => {
        const action = updateAction({ former, budget });
        dispatch(action);
        try {
            await backend.updateBudget(budget);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type UpdateActionParams = { former: Budget; budget: BudgetUpdateFields };
const updateAction = createActionCreator<UpdateActionParams>(UPDATE_BUDGET);

function reduceUpdate(state: BudgetState, action: Action<UpdateActionParams>) {
    if (action.status === SUCCESS) {
        const updated = action.budget;
        const key = makeKey(updated.year, updated.month);
        return produce(state, draft => {
            for (const [index, budget] of draft.budgets[key].entries()) {
                if (budget.categoryId === updated.categoryId) {
                    draft.budgets[key][index] = new Budget({ ...budget, ...updated });
                    continue;
                }
            }
        });
    }

    return state;
}

// Fetch budgets for a given month of a year.
export function fetchFromYearAndMonth(year: number, month: number) {
    return async (dispatch: Dispatch): Promise<void> => {
        const action = fetchBudgetsAction({ year, month });
        try {
            const results = await backend.fetchBudgets(year, month);
            action.results = results.budgets;
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

type FetchBudgetParams = { year: number; month: number; results?: Budget[] };
const fetchBudgetsAction = createActionCreator<FetchBudgetParams>(FETCH_BUDGETS);

function reduceFetch(state: BudgetState, action: Action<FetchBudgetParams>): BudgetState {
    if (action.status === SUCCESS) {
        return produce(state, draft => {
            assertDefined(action.results);
            const key = makeKey(action.year, action.month);
            draft.budgets[key] = action.results.map(b => new Budget(b));
        });
    }

    return state;
}

// Set the selected period for budgets.
export function setSelectedPeriod(year: number, month: number) {
    return (dispatch: Dispatch, getState: GetStateType): Promise<void> => {
        const action = setPeriodAction({ year, month });
        dispatch(action);

        if (!fromSelectedPeriod(getState().budgets)) {
            return fetchFromYearAndMonth(year, month)(dispatch);
        }

        return Promise.resolve();
    };
}

type SetPeriodParams = { year: number; month: number };
const setPeriodAction = createActionCreator<SetPeriodParams>(SET_BUDGETS_PERIOD);

function reduceSetPeriod(state: BudgetState, action: Action<SetPeriodParams>) {
    return produce(state, draft => {
        draft.year = action.year;
        draft.month = action.month;
    });
}

// Reset the budgets.
export function reset() {
    return (dispatch: Dispatch): void => dispatch(resetAction());
}

const resetAction = createActionCreator<void>(RESET_BUDGETS);

function reduceReset(state: BudgetState) {
    return produce(state, draft => {
        draft.budgets = {};
    });
}

// Reducers
const reducers = {
    [UPDATE_BUDGET]: reduceUpdate,
    [FETCH_BUDGETS]: reduceFetch,
    [SET_BUDGETS_PERIOD]: reduceSetPeriod,
    [RESET_BUDGETS]: reduceReset,
};

export const reducer = createReducerFromMap(reducers);

// Initial state
export function initialState(): BudgetState {
    const currentDate = new Date();
    return {
        budgets: {},
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
    };
}

// Getters
export function getSelectedPeriod(state: BudgetState): { year: number; month: number } {
    return { year: state.year, month: state.month };
}

export function fromSelectedPeriod(state: BudgetState): Budget[] | null {
    return state.budgets[makeKey(state.year, state.month)] || null;
}
