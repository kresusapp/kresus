// Define raw-loader loaded values. For some reasons, tsc on the command-line
// doesn't want this declaration to live in the global.d.ts file.
declare module 'raw-loader!*' {
    const value: string;
    export default value;
}
