module.exports = {
    'KRESUS': 'KRESUS',
    'Reports': 'Reports',
    'Charts': 'Charts',
    'Categories': 'Categories',
    'Similarities': 'Similarities',
    'Settings': 'Settings',
    'Banks': 'Banks',
    'Accounts': 'Accounts',

    'save': 'save',
    'cancel': 'cancel',
    'delete': 'delete',

    'Confirm deletion': 'Confirm deletion',
    'Dont delete': "Don't delete",

    'kresus-init-please-wait': 'Please wait during Kresus initialization...',
    'kresus-loading': 'Kresus is chasing unicorns, hang tight.',

    // When installing dependencies
    'Please wait during Kresus dependencies installation': 'Please wait during Kresus dependencies installation',
    'dependencies-install': 'After a while, please reload the page and contact a Kresus maintener and let us know if an error message shows up here below!',

    // Categories
    'add a category': 'add a category',
    'CATEGORY NAME': 'CATEGORY NAME',
    'ACTION': 'ACTION',
    'none_category': 'None',
    'edit': 'edit',
    'Dont replace': "Don't replace",

    // Charts
    'all': 'all',
    'by category': 'by category',
    'by category by month': 'by category by month',
    'balance': 'balance',
    'differences (account)': 'differences (account)',
    'differences (all)': 'differences (all)',
    'By category': 'By category',
    'Amount': 'Amount',
    'Received': 'Received',
    'Paid': 'Paid',
    'Saved': 'Saved',
    'Received / Paid / Saved over time': 'Received / Paid / Saved over time',

    // OperationList
    'Full label:': 'Full label:',
    'Amount:': 'Amount:',
    'Category:': 'Category:',
    'Any category': 'Any category',
    'Keywords': 'Keywords',
    'Category': 'Category',
    'Amount: low': 'Amount: low',
    'high': 'high',
    'Date: between': 'Date: between',
    'and': 'and',
    'clear': 'clear',
    'Search': 'Search',
    'Ohnoes!': 'Ohnoes!',
    'no-account-set': "It seems you haven't set any account! You can start by setting an account in the Settings section.",
    'Last synchronization with your bank:': 'Last synchronization with your bank:',
    'Synchronize now': 'Synchronize now',
    'Current Balance': 'Current Balance',
    'As of': 'As of',
    'For this search': 'For this search',
    'This month': 'This month',
    'Transactions': 'Transaction',
    'Date': 'Date',
    'Operation': 'Operation',

    // Settings
    'Name': 'Name',
    'Bank': 'Bank',
    'Website': 'Website',
    'ID': 'ID',
    'Password': 'Password',
    'Save': 'Save',
    'Configure a new bank access': 'Configure a new bank access',
    'Duplicate threshold': 'Duplicate threshold',
    'duplicate_help': 'Two operations will be considered as duplicates in the similarities section if they happened within this period of time (in hours).',
    'Bank accounts': 'Bank accounts',
    'Advanced (beta)': 'Advanced (beta)',

    // Similarities
    'No similar operations found.': 'No similar operations found.',
    'similarities_help': "Sometimes, importing bank transactions may lead to have duplicate transactions, for instance if the bank added some information to a given operation, a few days after its effective date.  This screen shows similarities between potential duplicates and allows you to manually remove the duplicate ones.  Note thatcategory is transferred upon deletion: if you have a pair of duplicates A/B, in which A has a category but B doesn't have one, and you choose to remove A, then B will inherit A's category.",

    // Parametred
    'erase_category': 'This will erase the category "%{title}". If there are operations which are mapped to this category, and you would like to update their category to an existing one, please choose it in this list (leaving it unmodified will affect all operations to the "None" category).',
    'erase_account': 'This will erase this account "%{title}" and all transactions that it contained. If it is the last account bound to this bank account, the bank account will be deleted as well. Are you sure you want to erase this account?',
    'erase_bank': 'This will erase this bank "%{name}" and all accounts and transactions that are associated with it. Are you sure you want to erase this bank and all associated accounts?'
}
