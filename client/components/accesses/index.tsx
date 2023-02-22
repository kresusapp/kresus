import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AccessesList from './accesses-list';
import NewAccess from './new-access';
import EditAccess from './edit-access';
import EditAccount from './edit-account';
import ListAccountRecurringTransactions from './account-recurring-transactions-list';
import NewAccountRecurringTransaction from './new-recurring-transaction';

import URL from './urls';
import './accesses.css';

export default () => {
    return (
        <Switch>
            <Route path={URL.newAccess}>
                <NewAccess />
            </Route>
            <Route path={URL.EDIT_ACCESS_PATTERN}>
                <EditAccess />
            </Route>
            <Route path={URL.NEW_ACCOUNT_RECURRING_TRANSACTION_PATTERN}>
                <NewAccountRecurringTransaction />
            </Route>
            <Route path={URL.LIST_ACCOUNT_RECURRING_TRANSACTIONS_PATTERN}>
                <ListAccountRecurringTransactions />
            </Route>
            <Route path={URL.EDIT_ACCOUNT_PATTERN}>
                <EditAccount />
            </Route>
            <Route path={URL.accessList}>
                <AccessesList />
            </Route>
            <Redirect to={URL.accessList} />
        </Switch>
    );
};
