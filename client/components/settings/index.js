import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';
import ThemesParameters from './themes';
import LogsSection from './logs';

import TabMenu from '../ui/tab-menu.js';

const SettingsComponents = props => {
    const pathPrefix = '/settings';

    let { currentAccountId } = props.match.params;

    let menuItems = new Map();
    menuItems.set(`${pathPrefix}/accounts/${currentAccountId}`, $t('client.settings.tab_accounts'));
    menuItems.set(`${pathPrefix}/emails/${currentAccountId}`, $t('client.settings.tab_alerts'));
    menuItems.set(`${pathPrefix}/backup/${currentAccountId}`, $t('client.settings.tab_backup'));
    menuItems.set(`${pathPrefix}/weboob/${currentAccountId}`, $t('client.settings.tab_weboob'));
    menuItems.set(`${pathPrefix}/themes/${currentAccountId}`, $t('client.settings.tab_themes'));
    menuItems.set(`${pathPrefix}/logs/${currentAccountId}`, $t('client.settings.tab_logs'));

    return (
        <div>
            <TabMenu
                selected={props.location.pathname}
                tabs={menuItems}
                history={props.history}
                location={props.location}
            />
            <Switch>
                <Route
                    path={`${pathPrefix}/accounts/${currentAccountId}`}
                    component={BankAccountsList}
                />
                <Route
                    path={`${pathPrefix}/backup/${currentAccountId}`}
                    component={BackupParameters}
                />
                <Route
                    path={`${pathPrefix}/weboob/${currentAccountId}`}
                    component={WeboobParameters}
                />
                <Route
                    path={`${pathPrefix}/emails/${currentAccountId}`}
                    component={EmailsParameters}
                />
                <Route
                    path={`${pathPrefix}/themes/${currentAccountId}`}
                    component={ThemesParameters}
                />
                <Route path={`${pathPrefix}/logs/${currentAccountId}`} component={LogsSection} />
                <Redirect to={`${pathPrefix}/accounts/${currentAccountId}`} push={false} />
            </Switch>
        </div>
    );
};

SettingsComponents.propTypes = {
    // The history object, providing access to the history API.
    // Automatically added by the Route component.
    history: PropTypes.object.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: PropTypes.object.isRequired
};

export default SettingsComponents;
