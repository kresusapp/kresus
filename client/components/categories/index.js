import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import List from './list';
import DeleteForm from './delete-form';
import { EditForm, NewForm } from './form';
import URL from './urls';

export default () => {
    return (
        <Switch>
            <Route path={URL.new}>
                {' '}
                <NewForm />
            </Route>
            <Route path={URL.EDIT_PATTERN}>
                <EditForm />
            </Route>
            <Route path={URL.DELETE_PATTERN}>
                <DeleteForm />
            </Route>
            <Route path={URL.list}>
                <List />
            </Route>
            <Redirect to={URL.list} push={false} />
        </Switch>
    );
};
