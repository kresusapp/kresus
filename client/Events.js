var Events = module.exports = {
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        changed_setting: 'the user changed a setting value',
        created_bank: 'the user submitted a bank access creation form',
        created_category: 'the user submitted a category creation form',
        deleted_account: 'the user clicked in order to delete an account',
        deleted_bank: 'the user clicked in order to delete a bank',
        deleted_operation: 'the user clicked in order to delete an operation',
        fetched_accounts: 'the user clicked in order to retrieve accounts of a given bank',
        fetched_operations: 'the user clicked in order to fetch operations for a specific bank account',
        selected_account: 'the user clicked to change the selected account, or a callback forced selection of an account',
        selected_bank: 'the user clicked to change the selected bank, or a callback forced selection of a bank',
        updated_category: 'the user submitted a category update form',
        updated_category_of_operation: 'the user changed the category of an operation in the select list',
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        deleted_account: 'an account has just been deleted on the server',
        deleted_bank: 'a bank has just been deleted on the server',
        deleted_operation: 'an operation has just been deleted on the server',
        loaded_accounts_any_bank: 'accounts from a particular given bank have been loaded from the server',
        loaded_accounts_current_bank: 'accounts from the current bank have been loaded from the server',
        loaded_banks: 'bank list has been loaded from the server',
        loaded_categories: 'category list has been loaded from the server',
        loaded_operations: 'operation list has been loaded from the server',
        saved_bank: 'a bank access was saved (created or updated) on the server.',
        saved_category: 'a category was saved (created or updated) on the server.',
        saved_category_of_operation: 'the category for an operation was saved (updated) on the server',
    }
};
