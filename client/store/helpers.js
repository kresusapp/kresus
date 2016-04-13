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

