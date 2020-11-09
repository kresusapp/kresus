import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AccessesList from './accesses-list';
import NewAccess from './new-access';
import EditAccess from './edit-access';

import URL from '../../urls';
import withCurrentAccountId from '../withCurrentAccountId';

import './accesses.css';

const AccessComponent = props => {
    let { currentAccountId } = props;
    return (
        <Switch>
            <Route path={URL.accesses.url('new')}>
                <NewAccess />
            </Route>
            <Route path={URL.accesses.url('edit', currentAccountId)}>
                <EditAccess accessId={currentAccountId} />
            </Route>
            <Route path={URL.accesses.url()}>
                <AccessesList />
            </Route>
            <Redirect to={URL.accesses.url()} />
        </Switch>
    );
};

export default withCurrentAccountId(AccessComponent);
