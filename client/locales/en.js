module.exports = {
    'KRESUS': 'KRESUS',
    'Reports': 'Reports',
    'Charts': 'Graphs',
    'Categories': 'Categories',
    'Similarities': 'Duplicates',
    'Settings': 'Settings',
    'Banks': 'Banks',
    'Accounts': 'Accounts',

    'save': 'save',
    'cancel': 'cancel',
    'delete': 'delete',

    'Confirm deletion': 'Confirm deletion',
    'Dont delete': "Don't delete",

    'kresus-init-please-wait': 'Please wait while Kresus initializes…',
    'kresus-loading': 'Kresus is chasing unicorns, hang tight.',

    // When installing dependencies
    'Please wait during Kresus dependencies installation': 'Please wait while Kresus installs dependencies…',
    'dependencies-install': 'Please reload the page in a short while, and contact a Kresus maintainer if you see any errors here!',

    // Categories
    'add a category': 'add a category',
    'CATEGORY NAME': 'CATEGORY NAME',
    'ACTION': 'ACTION',
    'none_category': 'None',
    'edit': 'edit',
    'Dont replace': "Don't replace",

    // Graphs
    'all': 'all',
    'by category': 'by category',
    'by category by month': 'by category (monthly)',
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
    'no-account-set': "It seems you haven't set up any account! You can start by adding one in the Settings section.",
    'Last synchronization with your bank:': 'Last sync with your bank:',
    'Synchronize now': 'Sync now',
    'Current Balance': 'Balance',
    'As of': 'As of',
    'For this search': 'For this search',
    'This month': 'This month',
    'Transactions': 'Transactions',
    'Date': 'Date',
    'Operation': 'Transaction',
    'download bill': 'Download related bill',

    // Settings
    'Name': 'Name',
    'Bank': 'Bank',
    'Website': 'Website',
    'ID': 'ID',
    'Password': 'Password',
    'Save': 'Save',
    'Configure a new bank access': 'Configure a new bank access',
    'Duplicate threshold': 'Duplication threshold',
    'duplicate_help': 'Two transactions will appear in the Duplicates section if they both happen within this period of time (in hours) of each other.',
    'Bank accounts': 'Bank accounts',
    'Advanced (beta)': 'Advanced (beta)',

    // Similarities
    'No similar operations found.': 'No similar transactions found.',
    'similarities_help': "Sometimes, importing bank transactions may lead to duplicate transactions, e.g. if the bank added information to a given transaction a few days after its effective date. This screen shows similarities between suspected transactions, and allows you to manually remove duplicates. Note: Categories may be transferred upon deletion: if you have a pair of duplicates A/B, in which A has a category but B doesn't, and you choose to delete A, then B will inherit A's category.",

    // Parametred
    'erase_category': 'This will erase the "%{title}" category. If there are transactions mapped to this category, and you would like to move them to an existing category, you can do so in this list (by default, all transactions will move to the "None" category). Are you sure about this?',
    'erase_account': 'This will erase the "%{title}" account, and all its transactions. If this is the last account bound to this bank, the bank will be erased as well. Are you sure about this?',
    'erase_bank': 'This will erase the "%{name}" bank, and all its associated accounts and transactions. Are you sure about this?'
}
