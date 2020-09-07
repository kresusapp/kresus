import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import URL from '../../urls';

import BackupParameters from './backup';
import CustomizationParameters from './customization';
import EmailsParameters from './emails';
import AdminSection from './admin';

import './settings.css';

const SettingsComponents = () => {
    return (
        <Switch>
            <Route path={URL.settings.url('backup')}>
                <BackupParameters />
            </Route>
            <Route path={URL.settings.url('customization')}>
                <CustomizationParameters />
            </Route>
            <Route path={URL.settings.url('emails')}>
                <EmailsParameters />
            </Route>
            <Route path={URL.settings.url('admin')}>
                <AdminSection />
            </Route>
            <Redirect to={URL.settings.url('accounts')} push={false} />
        </Switch>
    );
};
export default SettingsComponents;
