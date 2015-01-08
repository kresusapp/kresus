var Events = module.exports = {
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        created_category: 'the user submitted a category creation form',
        deleted_operation: 'the user clicked in order to delete an operation',
        updated_category_of_operation: 'the user changed the category of an operation in the select list',
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        deleted_operation: 'an operation has just been deleted on the server',
        loaded_accounts: 'accounts have been loaded from the server',
        loaded_banks: 'bank list has been loaded from the server',
        loaded_categories: 'category list has been loaded from the server',
        loaded_operations: 'operation list has been loaded from the server',
        saved_category: 'a category was saved (created or updated) on the server.',
        saved_category_of_operation: 'the category for an operation was saved (updated) on the server',
    },

    RETRIEVE_OPERATIONS_QUERIED: 'the user clicked on retrieve operations for a bank account',
    SELECTED_ACCOUNT_CHANGED: 'something changed the selected account',
    SELECTED_BANK_CHANGED: 'something changed the selected bank',
    UPDATE_CATEGORY: 'the user updated a category'
};
