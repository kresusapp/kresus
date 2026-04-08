import React from 'react';
import { Routes, Route, Navigate } from 'react-router';

import List from './list';
import NewRecurringTransaction from './new-recurring-transaction';
import EditRecurringTransaction from './edit-recurring-transaction';
import AccountRecurringTransactionsList from './account-recurring-transactions-list';

import URL from '../../urls';

export default () => {
    return (
        <Routes>
            <Route
                path="account/:accountId/new/:label?/:amount?/:day?/:type?"
                element={<NewRecurringTransaction />}
            />
            <Route path="edit/:id" element={<EditRecurringTransaction />} />
            <Route path="account/:accountId" element={<AccountRecurringTransactionsList />} />
            <Route path="/" element={<List />} />
            <Route
                path="*"
                element={<Navigate to={URL.recurringTransactions.pattern} replace={true} />}
            />
        </Routes>
    );
};
