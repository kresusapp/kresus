/* eslint-disable import/unambiguous */

interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: (...arg: any[]) => any;
}

// Define the type for raw-loaded modules (like LICENSE).
declare module 'raw-loader!*' {
    const content: any;
    export default content;
}
