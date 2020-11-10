/* eslint-disable import/unambiguous */
/* eslint-disable @typescript-eslint/no-unused-vars */

interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (...arg: any[]) => any;
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
