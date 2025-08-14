import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';

import ViewsList from './views-list';
import NewView from './new-view';
import EditView from './edit-view';

import URL from './urls';

export default () => {
    return (
        <Switch>
            <Route path={URL.newView}>
                <NewView />
            </Route>
            <Route path={URL.EDIT_VIEW_PATTERN}>
                <EditView />
            </Route>
            <Route path={URL.viewsList}>
                <ViewsList />
            </Route>
            <Redirect to={URL.viewsList} />
        </Switch>
    );
};
