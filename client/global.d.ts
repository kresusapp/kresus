/* eslint-disable import/unambiguous */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ThunkAction } from 'redux-thunk';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (...arg: any[]) => any;
    }
}

// Define the type for raw-loaded modules (like LICENSE).
declare module 'raw-loader!*' {
    const content: any;
    export default content;
}

// Define the type for require.ensure
declare namespace NodeJS {
    interface Require {
        // See here for the type definition:
        // https://webpack.js.org/api/module-methods/#requireensure
        ensure: (
            dependencies: string[],
            callback: (require: Require) => void,
            errorCallback?: (error: Error) => void,
            chunkName?: string
        ) => void;
    }
}

declare module 'redux' {
    /*
     * Overload to add thunk support to Redux's dispatch() function.
     * Useful for react-redux or any other library which could use this type.
     */
    export interface Dispatch<A extends Action = AnyAction> {
        <TReturnType = any, TState = any, TExtraThunkArg = any>(
            thunkAction: ThunkAction<TReturnType, TState, TExtraThunkArg, A>
        ): TReturnType;
    }
}
