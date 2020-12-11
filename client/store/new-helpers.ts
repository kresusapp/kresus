import { ActionType } from './actions';

export const SUCCESS = 'SUCCESS';
export const FAIL = 'FAIL';

// An action which has no specific status.
type KresusBaseAction<ActionParams> = ActionParams & {
    type: ActionType;
    status: null;
};

// An action which was successful.
type KresusSuccessAction<ActionParams> = ActionParams & {
    type: ActionType;
    status: typeof SUCCESS;
};

// An action which failed.
type KresusFailAction<ActionParams> = ActionParams & {
    type: ActionType;
    status: typeof FAIL;
    err: Error;
};

// All the types of action Kresus directly manipulate.
export type KresusAction<ActionParams> =
    | KresusBaseAction<ActionParams>
    | KresusSuccessAction<ActionParams>
    | KresusFailAction<ActionParams>;

export function createReducerFromMap<State>(map: {
    [id: string]: (state: State, action: KresusAction<any>) => State;
}) {
    return (state: State | null = null, action: KresusAction<any>): State | null => {
        if (state && map[action.type]) {
            return map[action.type](state, action);
        }
        return state;
    };
}

export const actionStatus = {
    // Returns an action similar to the one passed, with an extra status field
    // set to SUCCESS.
    ok<ActionParams>(action: KresusBaseAction<ActionParams>): KresusSuccessAction<ActionParams> {
        return {
            ...action,
            status: SUCCESS,
        };
    },

    // Returns an action similar to the one passed, with an extra status field
    // set to FAIL, and an attached error.
    err<ActionParams>(
        action: KresusBaseAction<ActionParams>,
        err: Error
    ): KresusFailAction<ActionParams> {
        return {
            ...action,
            err,
            status: FAIL,
        };
    },
};

// Creates a basic action creator of the given `type`. Parameters to the action
// creator must be passed in the form of a map.
export function createActionCreator<ActionCreatorParam extends Record<string, unknown>>(
    type: ActionType
): (param: ActionCreatorParam) => KresusBaseAction<ActionCreatorParam> {
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
