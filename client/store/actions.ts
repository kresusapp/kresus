// Banks
export const CREATE_ACCESS = 'CREATE_ACCESS';
export const CREATE_ALERT = 'CREATE_ALERT';
export const CREATE_TRANSACTION = 'CREATE_TRANSACTION';
export const DELETE_ACCESS = 'DELETE_ACCESS';
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const DELETE_ALERT = 'DELETE_ALERT';
export const DELETE_TRANSACTION = 'DELETE_TRANSACTION';
export const MERGE_TRANSACTIONS = 'MERGE_TRANSACTIONS';
export const REQUEST_USER_ACTION = 'REQUEST_USER_ACTION';
export const RUN_ACCOUNTS_SYNC = 'RUN_ACCOUNTS_SYNC';
export const RUN_BALANCE_RESYNC = 'RUN_BALANCE_RESYNC';
export const RUN_TRANSACTIONS_SYNC = 'RUN_TRANSACTIONS_SYNC';
export const RUN_APPLY_BULKEDIT = 'RUN_APPLY_BULKEDIT';
export const SET_TRANSACTION_CUSTOM_LABEL = 'SET_TRANSACTION_CUSTOM_LABEL';
export const SET_TRANSACTION_CATEGORY = 'SET_TRANSACTION_CATEGORY';
export const SET_TRANSACTION_TYPE = 'SET_TRANSACTION_TYPE';
export const SET_TRANSACTION_DATE = 'SET_TRANSACTION_DATE';
export const SET_TRANSACTION_BUDGET_DATE = 'SET_TRANSACTION_BUDGET_DATE';
export const UPDATE_ALERT = 'UPDATE_ALERT';

// UI
export const SET_IS_SMALL_SCREEN = 'SET_IS_SMALL_SCREEN';
export const SET_SEARCH_FIELDS = 'SET_SEARCH_FIELDS';
export const RESET_SEARCH = 'RESET_SEARCH';
export const TOGGLE_SEARCH_DETAILS = 'TOGGLE_SEARCH_DETAILS';
export const TOGGLE_MENU = 'TOGGLE_MENU';

// Categories
export const CREATE_CATEGORY = 'CREATE_CATEGORY';
export const DELETE_CATEGORY = 'DELETE_CATEGORY';
export const UPDATE_CATEGORY = 'UPDATE_CATEGORY';

// Budgets
export const SET_BUDGETS_PERIOD = 'SET_BUDGETS_PERIOD';
export const FETCH_BUDGETS = 'FETCH_BUDGETS';
export const UPDATE_BUDGET = 'UPDATE_BUDGET';

// Instance properties
export const IMPORT_INSTANCE = 'IMPORT_INSTANCE';
export const GET_WOOB_VERSION = 'GET_WOOB_VERSION';

// Settings
export const SET_DEFAULT_ACCOUNT = 'SET_DEFAULT_ACCOUNT';
export const SET_SETTING = 'SET_SETTING';
export const UPDATE_ACCESS = 'UPDATE_ACCESS';
export const UPDATE_ACCESS_AND_FETCH = 'UPDATE_ACCESS_AND_FETCH';

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
    | typeof CREATE_ACCESS
    | typeof CREATE_ALERT
    | typeof CREATE_TRANSACTION
    | typeof DELETE_ACCESS
    | typeof DELETE_ACCOUNT
    | typeof UPDATE_ACCOUNT
    | typeof DELETE_ALERT
    | typeof DELETE_TRANSACTION
    | typeof MERGE_TRANSACTIONS
    | typeof REQUEST_USER_ACTION
    | typeof RUN_ACCOUNTS_SYNC
    | typeof RUN_BALANCE_RESYNC
    | typeof RUN_TRANSACTIONS_SYNC
    | typeof RUN_APPLY_BULKEDIT
    | typeof SET_TRANSACTION_CUSTOM_LABEL
    | typeof SET_TRANSACTION_CATEGORY
    | typeof SET_TRANSACTION_TYPE
    | typeof SET_TRANSACTION_DATE
    | typeof SET_TRANSACTION_BUDGET_DATE
    | typeof UPDATE_ALERT
    | typeof SET_IS_SMALL_SCREEN
    | typeof SET_SEARCH_FIELDS
    | typeof RESET_SEARCH
    | typeof TOGGLE_SEARCH_DETAILS
    | typeof TOGGLE_MENU
    | typeof CREATE_CATEGORY
    | typeof DELETE_CATEGORY
    | typeof UPDATE_CATEGORY
    | typeof SET_BUDGETS_PERIOD
    | typeof FETCH_BUDGETS
    | typeof UPDATE_BUDGET
    | typeof IMPORT_INSTANCE
    | typeof GET_WOOB_VERSION
    | typeof SET_DEFAULT_ACCOUNT
    | typeof SET_SETTING
    | typeof UPDATE_ACCESS
    | typeof UPDATE_ACCESS_AND_FETCH
    | typeof ENABLE_DEMO_MODE;
