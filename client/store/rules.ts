import { produce } from 'immer';
import { DeepPartial, Dispatch } from 'redux';
import { assert, assertDefined } from '../helpers';
import { Rule, RuleAction, RuleCondition } from '../models';
import {
    CREATE_RULE,
    DELETE_RULE,
    LOAD_ALL_RULES,
    SWAP_RULE_POSITIONS,
    UPDATE_RULE,
} from './actions';
import {
    Action,
    actionStatus,
    createActionCreator,
    createReducerFromMap,
    mergeInArray,
    removeInArrayById,
    SUCCESS,
} from './helpers';
import * as backend from './backend';

export type RuleState = {
    rules: Rule[];
};

interface CreateActionParams {
    rule: DeepPartial<Rule>;
}

interface UpdateActionParams {
    rule: Partial<Rule>;
}

interface SwapPositionsActionParams {
    ruleId: number;
    otherRuleId: number;
}

// Create a new rule.
export interface CreateRuleArg {
    label: string;
    categoryId: number;
}

export function create(arg: CreateRuleArg) {
    return async (dispatch: Dispatch) => {
        const conditions: Partial<RuleCondition>[] = [
            {
                type: 'label_matches_text',
                value: arg.label,
            },
        ];

        const actions: Partial<RuleAction>[] = [
            {
                type: 'categorize',
                categoryId: arg.categoryId,
            },
        ];

        const rule = { conditions, actions };

        const action = createAction({ rule });
        dispatch(action);
        try {
            const created = await backend.createRule(rule);
            return dispatch(actionStatus.ok(createAction({ rule: created })));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

const createAction = createActionCreator<CreateActionParams>(CREATE_RULE);

function reduceCreate(state: RuleState, action: Action<CreateActionParams>) {
    if (action.status === SUCCESS) {
        return produce(state, (draft: RuleState) => {
            const r = new Rule(action.rule);
            draft.rules.push(r);
            return draft;
        });
    }
    return state;
}

// Update an existing rule.
export function update(rule: Rule, arg: CreateRuleArg) {
    return async (dispatch: Dispatch) => {
        assert(rule.conditions.length === 1, 'only one condition accepted at the moment');
        assert(rule.actions.length === 1, 'only one action accepted at the moment');

        const cond = rule.conditions[0];
        const act = rule.actions[0];

        const newAttr: Partial<Rule> = {
            conditions: [
                {
                    id: cond.id,
                    type: cond.type,
                    value: arg.label,
                },
            ],
            actions: [
                {
                    id: act.id,
                    type: act.type,
                    categoryId: arg.categoryId,
                },
            ],
        };

        const action = updateAction({ rule: { id: rule.id, ...newAttr } });
        dispatch(action);
        try {
            await backend.updateRule(rule.id, newAttr);
            return dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

const updateAction = createActionCreator<UpdateActionParams>(UPDATE_RULE);

function reduceUpdate(state: RuleState, action: Action<UpdateActionParams>) {
    if (action.status === SUCCESS) {
        return produce(state, (draft: RuleState) => {
            assert(typeof action.rule.id === 'number', 'id must be defined for edits');
            mergeInArray(draft.rules, action.rule.id, action.rule);
            return draft;
        });
    }
    return state;
}

// Swap the positions of two rules.
export function swapPositions(ruleId: number, otherRuleId: number) {
    return async (dispatch: Dispatch) => {
        const action = swapPositionsAction({ ruleId, otherRuleId });
        dispatch(action);
        try {
            await backend.swapRulePositions(ruleId, otherRuleId);
            return dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

const swapPositionsAction = createActionCreator<SwapPositionsActionParams>(SWAP_RULE_POSITIONS);

function reduceSwapPositions(state: RuleState, action: Action<SwapPositionsActionParams>) {
    if (action.status === SUCCESS) {
        return produce(state, (draft: RuleState) => {
            const first = draft.rules.findIndex(rule => rule.id === action.ruleId);
            const second = draft.rules.findIndex(rule => rule.id === action.otherRuleId);

            const firstData = draft.rules[first];
            draft.rules[first] = draft.rules[second];
            draft.rules[second] = firstData;

            return draft;
        });
    }
    return state;
}

// Delete an existing rule.
export function destroy(id: number) {
    return async (dispatch: Dispatch) => {
        const action = deleteAction({ id });
        dispatch(action);
        try {
            await backend.deleteRule(id);
            return dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

interface DeleteParams {
    id: number;
}
const deleteAction = createActionCreator<DeleteParams>(DELETE_RULE);

function reduceDelete(state: RuleState, action: Action<DeleteParams>) {
    if (action.status === SUCCESS) {
        return produce(state, (draft: RuleState) => {
            removeInArrayById(draft.rules, action.id);
            return draft;
        });
    }
    return state;
}

// Loads all the rules.
export function loadAll() {
    return async (dispatch: Dispatch) => {
        const action = loadAllAction({});
        dispatch(action);
        try {
            const retrieved = await backend.loadRules();
            dispatch(actionStatus.ok(loadAllAction({ rules: retrieved })));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
        }
    };
}

interface LoadAllParams {
    rules?: Rule[];
}
const loadAllAction = createActionCreator<LoadAllParams>(LOAD_ALL_RULES);

function reduceLoadAll(state: RuleState, action: Action<LoadAllParams>) {
    if (action.status === SUCCESS) {
        return produce(state, draft => {
            assertDefined(action.rules);
            draft.rules = action.rules;
            return draft;
        });
    }
    return state;
}

// Reducer.
export const reducer = createReducerFromMap<RuleState>({
    [CREATE_RULE]: reduceCreate,
    [UPDATE_RULE]: reduceUpdate,
    [DELETE_RULE]: reduceDelete,
    [LOAD_ALL_RULES]: reduceLoadAll,
    [SWAP_RULE_POSITIONS]: reduceSwapPositions,
});

export function initialState(): RuleState {
    return { rules: [] };
}

// Getters

export function getAll(state: RuleState): Rule[] {
    return state.rules;
}

export function getById(state: RuleState, id: number): Rule | undefined {
    return state.rules.find(r => r.id === id);
}
