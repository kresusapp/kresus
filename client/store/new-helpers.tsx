import { Action, AnyAction } from 'redux';

import { ActionType } from './actions';

export const SUCCESS = 'SUCCESS';
export const FAIL = 'FAIL';

export function createReducerFromMap<State>(map: {
    [id: string]: (state: State, action: ActionWithStatus) => State;
}) {
    return (state: State | null = null, action: ActionWithStatus) => {
        if (state && map[action.type]) {
            return map[action.type](state, action);
        }
        return state;
    };
}

interface ActionWithStatus extends AnyAction {
    status: null | typeof SUCCESS | typeof FAIL;
}

export const actionStatus = {
    // Returns an action similar to the one passed, with an extra status field
    // set to SUCCESS.
    ok(action: Action<ActionType>): ActionWithStatus {
        return {
            ...action,
            status: SUCCESS,
        };
    },

    // Returns an action similar to the one passed, with an extra status field
    // set to FAIL, and an attached error.
    err(action: Action<ActionType>, err: Error): ActionWithStatus {
        return {
            ...action,
            err,
            status: FAIL,
        };
    },
};

// Creates a basic action creator of the given `type`. Parameters to the action
// creator must be passed in the form of a map.
export function createActionCreator<ActionCreatorParam>(
    type: ActionType
): (param: ActionCreatorParam) => ActionWithStatus {
    return (obj: ActionCreatorParam) => {
        return {
            ...obj,
            type,
            status: null,
        };
    };
}

interface HasId {
    id: number;
}

// For things with ids, replace the element with the given id in the array to
// the element passed in parameters.
export function updateInArray<T extends HasId>(array: T[], id: number, newEntry: T) {
    const i = array.findIndex(obj => obj.id === id);
    array[i] = newEntry;
    return array;
}

// For things with ids, removes the thing with the given id from the array.
export function removeInArray<T extends HasId>(array: T[], id: number) {
    const i = array.findIndex(obj => obj.id === id);
    array.splice(i, 1);
}
