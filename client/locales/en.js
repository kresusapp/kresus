module.exports = {

    KRESUS: 'KRESUS',

    accounts: {
        title: 'Accounts',
    },

    accountwizard: {
        title: 'Welcome!',
        content: "Kresus is a personal finances manager which allows you to better understand which are your expenditures by calculating interesting statistics based on you banking transactions. To begin, please fill the form below:",
    },

    amount_well: {
        current_search: 'Current search',
        this_month: 'Ce mois',
    },

    banks: {
        title: 'Banks',
    },

    category: {
        none: 'Without',
        add: 'add a category',
        column_category_name: 'NAME',
        column_action: 'ACTION',
        dont_replace: 'Do not replace',
        erase: "This will erase the category '%{title}'. If there are tranactions assigned to this category, you can reassing them to an existing category thanks to the dropdown (else these transactions won't be assigned to any category). Are you sure you want to delete this category?",
        title: 'Categories',
        label: 'Label'
    },

    changepasswordmodal: {
        not_empty: "The password is mandatory!",
        title: "Change the account password",
        body: "If your bank account has changed, you can change it here so that Kresus keeps working.",
        cancel: "Cancel",
        save: "Save",
    },

    confirmdeletemodal: {
        title: 'Confirmation request',
        confirm: 'Confirm deletion',
        dont_delete: "Do not delete",
    },

    charts: {
        Amount: 'Amount',
        balance: 'balance',
        By_category: 'By category',
        by_category: 'by category',
        differences_account: 'incomes and outcomes (account)',
        differences_all: 'incomes and outcomes (all accounts)',
        Paid: 'Paid',
        Received: 'Received',
        Received_Paid_Saved_over_time: 'Recevied / Paid / Saved over time',
        Saved: 'Saved',
        title: 'Charts',

        type: 'Type',
        all_types: 'Both',
        positive: 'Incomes',
        negative: 'Outcomes',

        period: 'Period',
        all_periods: 'All the time',
        current_month: 'Current month',
        last_month: 'Previous month',
        three_months: 'Last three months',
        six_months: 'Last six months',

        unselect_all_categories: 'Unselect all categories',
        select_all_categories: 'Select all categories'
    },

    general: {
        cancel: 'cancel',
        delete: 'delete',
        edit: 'edit',
        save: 'save',
    },

    loadscreen: {
        title: "Please wait while Kresus dependencies are being installed",
        prolix: "In a few minutes, refresh the page. If Kresus does not full displays, please contact the authors by giving them the content of the debug window below.",
    },

    menu: {
        banks: 'Banks',
        categories: 'Categories',
        charts: 'Charts',
        settings: 'Settings',
        similarities: 'Duplicates',
        sublists: 'Accounts',
        reports: 'Reports',
    },

    operations: {
        amount: 'Amount:',

        column_date: 'Date',
        column_name: 'Transaction',
        column_amount: 'Amount',
        column_category: 'Category',

        current_balance: 'Current balance',
        as_of: 'As of the',
        received: 'Received',
        paid: 'Paid',
        saved: 'Saved',

        attached_file: 'Download the associated file',

        full_label: 'Full label:',
        category: 'Category',
        kresus_init_title: "Please wait during Kresus initialization",
        kresus_init_content: "Kresus is downloading some magic, hang on!",

        last_sync: 'Last synchronization with your bank:',
        sync_now: 'Synchronize now',
        syncing: 'Fetching your last transactions…',

        title: 'Transactions',
    },

    search: {
        any_category: "Any category",
        keywords: "Keywords :",
        category: 'Category :',
        amount_low: 'Amount : between',
        and: 'and',
        date_low: 'Date : between',
        clear: 'clear',
        title: 'Search',
    },

    settings: {
        column_account_name: 'Name',
        website: 'Regional site',
        bank: 'Bank',
        login: 'Login',
        password: 'Password',
        new_bank_form_title: 'Configure a new access',
        duplicate_threshold: 'Duplicate threshold',
        duplicate_help: 'Two transactions are considered as duplicates in the Duplicates side if they arrived during this duration (in hours).',

        reinstall_weboob: 'Reinstall Weboob',
        go_reinstall_weboob: "Let's go!",
        reinstall_weboob_help: "This procedure will entirely reinstall Weboob. This might take several minutes, during which you will not be able to import your accounts and transactions. Only use in last resort!",

        title: 'Parameters',

        tab_accounts: 'Bank accounts',
        tab_advanced: 'Advanced (beta)',
        tab_about: 'About',

        erase_account: "This will delete the account '%{title}' and all associated banking transactions. If this is the last account linked to this bank, the bank bond will me removed. Are you sure you want to delete this account?",
        erase_bank: "This will delete the bank named '%{name}' and all accounts and categories associated. Are you sure you want to delete this bank and all associated accounts?",
        missing_login_or_password: "The login and passwords are mandatory",
        submit: 'Save',

        delete_account_button: "Delete account",
        delete_bank_button: "Delete kank",
        reload_accounts_button: "Update the accounts",
        change_password_button: "Update the password",
        add_bank_button: "Add a bank",

        default_chart_type: "Charts : default transactions type",
        default_chart_period: "Charts : default period",
    },

    similarity: {
        nothing_found: "No transactions duplicates were found.",
        title: "Duplicates",
        help: "During the banking transactions import, some of them might be imported twice, for example when the bank add some information on a transaction about a few days after it happened. This screen will show you the potential duplicated (transactions which have the same amount on a given period). Notice: the categories are transfered during the deletion: if in a pair of duplicates A / B in which A has a category and B has not, deleting A will automatically reaffect its category to B.",
        date: "Date",
        label: "Transaction label",
        amount: "Amount",
        category: "Category",
        imported_on: "Imported on",
        merge: "Merge",
    },
}
