var Events = module.exports = {
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        created_category: 'the user submitted a category creation form',
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        loaded_accounts: 'accounts have been loaded from the server',
        loaded_banks: 'bank list has been loaded from the server',
        loaded_categories: 'category list has been loaded from the server',
        saved_category: 'a category was saved (created or updated) on the server.',
    },

    DELETE_OPERATION: 'the user asked to delete an operation',
    DELETED_OPERATION: 'an operation has just been deleted on the server',
    OPERATIONS_LOADED: 'operations have been loaded',
    OPERATION_CATEGORY_CHANGED: 'user changed the category of an operation',
    OPERATION_CATEGORY_SAVED: 'the category for an operation was set on the server',
    RETRIEVE_OPERATIONS_QUERIED: 'the user clicked on retrieve operations for a bank account',
    SELECTED_ACCOUNT_CHANGED: 'something changed the selected account',
    SELECTED_BANK_CHANGED: 'something changed the selected bank',
    UPDATE_CATEGORY: 'the user updated a category'
};
