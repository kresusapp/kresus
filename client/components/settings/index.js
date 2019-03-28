import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import URL from '../../urls';

import BackupParameters from './backup';
import BankAccountsList from './bank-accesses';
import CategoryList from '../categories';
import CustomizationParameters from './customization';
import EmailsParameters from './emails';
import LogsSection from './logs';
import WeboobParameters from './weboob';

const SettingsComponents = props => {
    let currentAccountId = URL.settings.accountId(props.match);
    return (
        <Switch>
            <Route
                path={URL.settings.url('accounts', currentAccountId)}
                component={BankAccountsList}
            />
            <Route
                path={URL.settings.url('backup', currentAccountId)}
                component={BackupParameters}
            />
            <Route
                path={URL.settings.url('categories', currentAccountId)}
                component={CategoryList}
            />
            <Route
                path={URL.settings.url('customization', currentAccountId)}
                component={CustomizationParameters}
            />
            <Route
                path={URL.settings.url('emails', currentAccountId)}
                component={EmailsParameters}
            />
            <Route path={URL.settings.url('logs', currentAccountId)} component={LogsSection} />
            <Route
                path={URL.settings.url('weboob', currentAccountId)}
                component={WeboobParameters}
            />

            <Redirect to={URL.settings.url('accounts', currentAccountId)} push={false} />
        </Switch>
    );
};

export default SettingsComponents;
