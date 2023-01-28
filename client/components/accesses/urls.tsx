import URL from '../../urls';

const BASE = URL.accesses.pattern;

export default {
    accessList: BASE,

    newAccess: `${BASE}/new`,

    editAccess(id: number) {
        return `${BASE}/edit-access/${id}`;
    },
    EDIT_ACCESS_PATTERN: `${BASE}/edit-access/:accessId`,

    editAccount(id: number) {
        return `${BASE}/edit-account/${id}`;
    },
    EDIT_ACCOUNT_PATTERN: `${BASE}/edit-account/:accountId`,

    listAccountRecurringTransactions(id: number) {
        return `${BASE}/edit-account/${id}/recurring-transactions`;
    },
    LIST_ACCOUNT_RECURRING_TRANSACTIONS_PATTERN: `${BASE}/edit-account/:accountId/recurring-transactions`,

    newAccountRecurringTransaction(
        id: number,
        predefined?: {
            label: string;
            amount: number;
            day: number;
            type: string;
        }
    ) {
        const blank = `${BASE}/edit-account/${id}/recurring-transactions/new`;
        if (predefined) {
            return `${blank}/${window.encodeURIComponent(predefined.label)}/${predefined.amount}/${
                predefined.day
            }/${predefined.type}`;
        }

        return blank;
    },
    NEW_ACCOUNT_RECURRING_TRANSACTION_PATTERN: `${BASE}/edit-account/:accountId/recurring-transactions/new/:label?/:amount?/:day?/:type?`,
};
