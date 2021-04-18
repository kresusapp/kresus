import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AccessesList from './accesses-list';
import NewAccess from './new-access';
import EditAccess from './edit-access';

import URL from './urls';
import './accesses.css';

export default () => {
    return (
        <Switch>
            <Route path={URL.new}>
                <NewAccess />
            </Route>
            <Route path={URL.EDIT_PATTERN}>
                <EditAccess />
            </Route>
            <Route path={URL.list}>
                <AccessesList />
            </Route>
            <Redirect to={URL.list} />
        </Switch>
    );
};
