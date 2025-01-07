import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import List from './list';
import NewRecurringTransaction from './new-recurring-transaction';
import EditRecurringTransaction from './edit-recurring-transaction';
import AccountRecurringTransactionsList from './account-recurring-transactions-list';

import URL from '../../urls';

export default () => {
    return (
        <Switch>
            <Route path={URL.newAccountRecurringTransaction.pattern}>
                <NewRecurringTransaction />
            </Route>
            <Route path={URL.editRecurringTransaction.pattern}>
                <EditRecurringTransaction />
            </Route>
            <Route path={URL.accountRecurringTransactions.pattern}>
                <AccountRecurringTransactionsList />
            </Route>
            <Route path={URL.recurringTransactions.pattern}>
                <List />
            </Route>
            <Redirect to={URL.recurringTransactions.pattern} />
        </Switch>
    );
};
