export const FAIL = "FAIL";
export const SUCCESS = "SUCCESS";

export function makeStatusHandlers(simpleCreator) {
    return [
        // Fail
        function(error, ...rest) {
            return Object.assign({}, simpleCreator(...rest), {status: FAIL, error});
        },
        // Success
        function(...rest) {
            return Object.assign({}, simpleCreator(...rest), {status: SUCCESS});
        }
    ];
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
