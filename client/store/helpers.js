import u from 'updeep';
import { createSelectorCreator, defaultMemoize } from 'reselect';

export const FAIL = 'FAIL';
export const SUCCESS = 'SUCCESS';

function createOutcomeHandlers(name, basic, fail, success) {
    const simpleCreator = basic[name];

    fail[name] = function(error, ...rest) {
        return Object.assign({}, simpleCreator(...rest), { status: FAIL, error });
    };

    success[name] = function(...rest) {
        return Object.assign({}, simpleCreator(...rest), { status: SUCCESS });
    };
}

export function fillOutcomeHandlers(basic, fail, success) {
    for (let name of Object.keys(basic)) {
        createOutcomeHandlers(name, basic, fail, success);
    }
}

const _compose = (f, g) => x => g(f(x));

export function compose(...args) {
    let ret = args[0];
    for (let i = 1; i < args.length; i++)
        ret = _compose(ret, args[i]);
    return ret;
}

export function createReducerFromMap(initialState, map) {
    return function(state = initialState, action) {
        if (action.type in map)
            return map[action.type](state, action);
        return state;
    };
}

export function updateMapIf(field, value, update) {
    return u.map(u.if(u.is(field, value), update));
}

// Create a createSelector which will update the cache data only when at least 2
// ids at the same index differ
export const arrayIdCreateSelector = createSelectorCreator(
    defaultMemoize,
    (prevArray, newArray) => {
        if (prevArray.length !== newArray.length) {
            return false;
        }

        for (let idx = 0; idx < prevArray.length; idx++) {
            if (prevArray[idx] !== newArray[idx]) {
                return false;
            }
        }
        return true;
    }
);
