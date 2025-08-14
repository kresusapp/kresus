import { DeepPartial } from 'typeorm';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assert } from '../helpers';
import { Rule, RuleAction, RuleCondition, assertValidRule } from '../models';
import { mergeInArray, removeInArrayById, resetStoreReducer } from './helpers';
import * as backend from './backend';

export type RuleState = {
    rules: Rule[];
};

// Create a new rule.
export interface CreateRuleArg {
    label: string;
    amount: number | null;
    categoryId: number;
}

export const create = createAsyncThunk('rules/create', async (arg: CreateRuleArg) => {
    const conditions: Partial<RuleCondition>[] = [
        {
            type: 'label_matches_text',
            value: arg.label,
        },
    ];

    if (arg.amount !== null) {
        conditions.push({
            type: 'amount_equals',
            value: arg.amount.toString(),
        });
    }

    const actions: Partial<RuleAction>[] = [
        {
            type: 'categorize',
            categoryId: arg.categoryId,
        },
    ];

    const rule = { conditions, actions };

    const created = await backend.createRule(rule);
    assertValidRule(created);
    return created;
});

// Update an existing rule.
export const update = createAsyncThunk(
    'rules/update',
    async (params: { rule: Rule; arg: CreateRuleArg }) => {
        const { rule, arg } = params;
        assert(rule.conditions.length > 0, 'at least one condition required');
        assert(rule.actions.length === 1, 'only one action accepted at the moment');

        const act = rule.actions[0];

        const conditions: Partial<RuleCondition>[] = [];

        if (arg.label) {
            conditions.push({
                type: 'label_matches_text',
                value: arg.label,
            });
        }

        if (arg.amount !== null) {
            conditions.push({
                type: 'amount_equals',
                value: arg.amount.toString(),
            });
        }

        const newAttr: DeepPartial<Rule> = {
            conditions,
            actions: [
                {
                    id: act.id,
                    type: act.type,
                    categoryId: arg.categoryId,
                },
            ],
        };

        await backend.updateRule(rule.id, newAttr);
        return {
            id: rule.id,
            ...newAttr,
        };
    }
);

// Swap the positions of two rules.
export const swapPositions = createAsyncThunk(
    'rules/swapPositions',
    async (params: { ruleId: number; otherRuleId: number }) => {
        await backend.swapRulePositions(params.ruleId, params.otherRuleId);
    }
);

// Delete an existing rule.
export const destroy = createAsyncThunk('rules/destroy', async (id: number) => {
    await backend.deleteRule(id);
    return id;
});

// Loads all the rules.
export const loadAll = createAsyncThunk('rules/loadAll', async () => {
    const retrieved = await backend.loadRules();
    return retrieved;
});

const sortConditions = (condA: RuleCondition, condB: RuleCondition) => {
    if (condA.type === condB.type) return 0;

    // 'label_matches_text' should be in first
    if (condA.type === 'label_matches_text') return -1;

    if (condB.type === 'label_matches_text') return 1;

    // Then 'label_matches_regexp'
    if (condA.type === 'label_matches_regexp') return -1;

    // Else 'amount_equals' for example.
    return 1;
};

const rulesSlice = createSlice({
    name: 'rules',
    initialState: {
        rules: [],
    } as RuleState,
    reducers: {
        reset: resetStoreReducer<RuleState>,
    },
    extraReducers: builder => {
        builder
            .addCase(create.fulfilled, (state, action) => {
                state.rules.push(action.payload);
            })
            .addCase(update.fulfilled, (state, action) => {
                const rule = action.payload;
                assert(typeof rule.id === 'number', 'id must be defined for edits');
                mergeInArray(state.rules, rule.id, rule as Rule);
            })
            .addCase(destroy.fulfilled, (state, action) => {
                removeInArrayById(state.rules, action.payload);
            })
            .addCase(swapPositions.fulfilled, (state, action) => {
                const first = state.rules.findIndex(rule => rule.id === action.meta.arg.ruleId);
                const second = state.rules.findIndex(
                    rule => rule.id === action.meta.arg.otherRuleId
                );

                const firstData = state.rules[first];
                state.rules[first] = state.rules[second];
                state.rules[second] = firstData;
            })
            .addCase(loadAll.fulfilled, (state, action) => {
                state.rules = action.payload;
                state.rules.forEach(rule => rule.conditions.sort(sortConditions));
            });
    },
});

export const initialState = rulesSlice.getInitialState();

export const name = rulesSlice.name;

export const actions = rulesSlice.actions;

export const reducer = rulesSlice.reducer;

// Getters

export function getAll(state: RuleState): Rule[] {
    return state.rules;
}

export function getById(state: RuleState, id: number): Rule | undefined {
    return state.rules.find(r => r.id === id);
}
