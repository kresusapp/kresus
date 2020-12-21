import React from 'react';
import { Switch, Route } from 'react-router-dom';

import URL from './urls';

import Details from './details';

export default () => {
    return (
        <Switch>
            <Route path={URL.details.pattern}>
                <Details />
            </Route>
        </Switch>
    );
};
