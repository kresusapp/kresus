import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AccessesList from './accesses-list';
import NewAccess from './new-access';

import URL from '../../urls';

export default () => {
    return (
        <Switch>
            <Route path={URL.accesses.url('new')}>
                <NewAccess />
            </Route>
            <Route path={URL.accesses.url()}>
                <AccessesList />
            </Route>
            <Redirect to={URL.accesses.url()} />
        </Switch>
    );
};
