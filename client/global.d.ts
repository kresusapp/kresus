/* eslint-disable import/unambiguous */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Allow side-effect imports of CSS files.
declare module '*.css';

// Allow side-effect imports of moment locale files.
declare module 'moment/dist/locale/*';

// Allow side-effect imports of flatpickr locale files.
declare module 'flatpickr/dist/l10n/*';

// chartjs-adapter-moment has no type declarations.
declare module 'chartjs-adapter-moment';

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
