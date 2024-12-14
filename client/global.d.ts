/* eslint-disable import/unambiguous */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
