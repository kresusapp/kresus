import { assert } from '../helpers';
import { ActionType } from './actions';

export const SUCCESS = 'SUCCESS';
export const FAIL = 'FAIL';

// An action that was just created and has no associated status yet.
type BaseAction<ActionParams> = ActionParams & {
    type: ActionType;
    status: null;
};

// An action which was successful.
type SuccessAction<ActionParams> = ActionParams & {
    type: ActionType;
    status: typeof SUCCESS;
};

// An action which failed.
type FailAction<ActionParams> = ActionParams & {
    type: ActionType;
    status: typeof FAIL;
    err: Error & { code?: string };
};

// All the types of action Kresus directly manipulate.
export type Action<ActionParams> =
    | BaseAction<ActionParams>
    | SuccessAction<ActionParams>
    | FailAction<ActionParams>;

export function createReducerFromMap<State>(map: {
    [id: string]: (state: State, action: Action<any>) => State;
}) {
    return (state: State | null = null, action: Action<any>): State | null => {
        if (state && map[action.type]) {
            return map[action.type](state, action);
        }
        return state;
    };
}

export const actionStatus = {
    // Returns an action similar to the one passed, with an extra status field
    // set to SUCCESS.
    ok<ActionParams>(action: BaseAction<ActionParams>): SuccessAction<ActionParams> {
        return {
            ...action,
            status: SUCCESS,
        };
    },

    // Returns an action similar to the one passed, with an extra status field
    // set to FAIL, and an attached error.
    err<ActionParams>(action: BaseAction<ActionParams>, err: Error): FailAction<ActionParams> {
        return {
            ...action,
            err,
            status: FAIL,
        };
    },
};

// Type helper that disallows action parameters to contain "type" or "status"
// fields, since we're going to add those in the action creators.
type BareAction<T extends Record<string, any> | void> = Exclude<T, { type?: any; status?: any }>;

// Creates a basic action creator of the given `type`. Parameters to the action
// creator must be passed in the form of a map.
export function createActionCreator<ActionCreatorParam extends Record<string, any> | void>(
    type: ActionType
): (param: BareAction<ActionCreatorParam>) => BaseAction<ActionCreatorParam> {
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
export function replaceInArray<T extends HasId>(array: T[], id: number, newEntry: T) {
    const i = array.findIndex(obj => obj.id === id);
    array[i] = newEntry;
    return array;
}

// For things with ids, merges the element with the given id in the array with
// the element passed in parameters.
export function mergeInArray<T extends HasId>(array: T[], id: number, fields: Partial<T>) {
    const i = array.findIndex(obj => obj.id === id);
    array[i] = { ...array[i], ...fields };
    return array;
}

// Merges the destination with the new fields.
export function mergeInObject<T>(
    obj: Record<number | string, T>,
    id: number | string,
    fields: Partial<T>
) {
    obj[id] = { ...obj[id], ...fields };
}

// For things with ids, removes the thing with the given id from the array.
export function removeInArrayById<T extends HasId>(array: T[], id: number) {
    const i = array.findIndex(obj => obj.id === id);
    assert(i !== -1, 'must have found the element to remove');
    array.splice(i, 1);
}

export function removeInArray<T>(array: T[], id: T) {
    const i = array.findIndex(aid => aid === id);
    assert(i !== -1, 'must have found the element to remove');
    array.splice(i, 1);
}
