import React from 'react';
import { Switch, Route } from 'react-router-dom';

import URL from './urls';

import CreateTransaction from './create';
import Details from './details';

export default () => {
    return (
        <Switch>
            <Route path={URL.new.pattern}>
                <CreateTransaction />
            </Route>
            <Route path={URL.details.pattern}>
                <Details />
            </Route>
        </Switch>
    );
};
