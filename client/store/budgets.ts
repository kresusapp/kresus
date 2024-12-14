import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { Budget, assertValidBudget } from '../models';

import * as backend from './backend';
import { create as createCategories, destroy as destroyCategories } from './categories';

import { assert, assertDefined } from '../helpers';
import { resetStoreReducer } from './helpers';
import { batch } from './batch';

type Period = { year: number; month: number };

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
export const update = createAsyncThunk(
    'budgets/update',
    async (params: { former: Budget; newer: BudgetUpdateFields }) => {
        (await backend.updateBudget(params.newer)) as Budget;
        return params.newer;
    }
);

// Fetch budgets for a given month of a year.
export const fetchFromYearAndMonth = createAsyncThunk(
    'budgets/fetchFromYearAndMonth',
    async (params: Period) => {
        const results = (await backend.fetchBudgets(params.year, params.month)) as Period & {
            budgets: Budget[];
        };
        assert(
            results.year === params.year && results.month === params.month,
            'Budget received is not the one requested'
        );
        return results;
    }
);

const currentDate = new Date();

const budgetsSlice = createSlice({
    name: 'budgets',
    initialState: {
        budgets: {},
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
    } as BudgetState,
    reducers: {
        reset: resetStoreReducer<BudgetState>,

        setSelectedPeriod: {
            reducer(state, action: PayloadAction<Period>) {
                state.year = action.payload.year;
                state.month = action.payload.month;
            },
            prepare(year: number, month: number) {
                return {
                    payload: {
                        year,
                        month,
                    },
                };
            },
        },
    },
    extraReducers: builder => {
        builder
            .addCase(update.fulfilled, (state, action) => {
                const updated = action.payload;
                const key = makeKey(updated.year, updated.month);

                for (const [index, budget] of state.budgets[key].entries()) {
                    if (budget.categoryId === updated.categoryId) {
                        const updatedBudget = { ...budget, ...updated };
                        assertValidBudget(updatedBudget);
                        state.budgets[key][index] = updatedBudget;
                        continue;
                    }
                }
            })
            .addCase(fetchFromYearAndMonth.fulfilled, (state, action) => {
                assertDefined(action.payload);
                const key = makeKey(action.payload.year, action.payload.month);
                state.budgets[key] = action.payload.budgets.map(b => {
                    assertValidBudget(b);
                    return b;
                });
            })
            .addCase(createCategories.fulfilled, state => {
                // Reset the budgets.
                state.budgets = {};
            })
            .addCase(destroyCategories.fulfilled, state => {
                // Reset the budgets.
                state.budgets = {};
            })
            .addCase(batch.fulfilled, (state, action) => {
                if (
                    action.payload.categories &&
                    (action.payload.categories.deleted || action.payload.categories.created)
                ) {
                    // Reset the budgets.
                    state.budgets = {};
                }
            });
    },
});

export const initialState = budgetsSlice.getInitialState();
export const { setSelectedPeriod } = budgetsSlice.actions;

export const name = budgetsSlice.name;

export const actions = budgetsSlice.actions;

export const reducer = budgetsSlice.reducer;

// Getters
export function getSelectedPeriod(state: BudgetState): Period {
    return { year: state.year, month: state.month };
}

export function fromSelectedPeriod(state: BudgetState): Budget[] | null {
    return state.budgets[makeKey(state.year, state.month)] || null;
}
