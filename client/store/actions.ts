// Instance properties
export const IMPORT_INSTANCE = 'IMPORT_INSTANCE';
export const GET_WOOB_VERSION = 'GET_WOOB_VERSION';

// Demo
export const ENABLE_DEMO_MODE = 'ENABLE_DEMO_MODE';

// Rules
export const LOAD_ALL_RULES = 'LOAD_ALL_RULES';
export const CREATE_RULE = 'CREATE_RULE';
export const UPDATE_RULE = 'UPDATE_RULE';
export const DELETE_RULE = 'DELETE_RULE';
export const SWAP_RULE_POSITIONS = 'SWAP_RULE_POSITIONS';

export type ActionType =
    | typeof LOAD_ALL_RULES
    | typeof CREATE_RULE
    | typeof DELETE_RULE
    | typeof UPDATE_RULE
    | typeof SWAP_RULE_POSITIONS
    | typeof IMPORT_INSTANCE
    | typeof GET_WOOB_VERSION
    | typeof ENABLE_DEMO_MODE;
