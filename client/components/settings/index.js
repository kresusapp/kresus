import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';

import TabMenu from '../ui/tab-menu.js';

const SettingsComponents = props => {
    let menuItems = new Map();
    menuItems.set('/settings/accounts', $t('client.settings.tab_accounts'));
    menuItems.set('/settings/emails', $t('client.settings.tab_alerts'));
    menuItems.set('/settings/backup', $t('client.settings.tab_backup'));
    menuItems.set('/settings/weboob', $t('client.settings.tab_weboob'));

    const redirectComponent = () => <Redirect to="/settings/accounts" />;

    return (
        <div>
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.settings.title') }
                    </h3>
                </div>

                <div className="panel-body">
                    <TabMenu
                      selected={ props.location.pathname }
                      tabs={ menuItems }
                      push={ props.push }
                    />
                    <Switch>
                        <Route
                          path="/settings"
                          render={ redirectComponent }
                          exact={ true }
                        />
                        <Route
                          path="/settings/accounts"
                          component={ BankAccountsList }
                        />
                        <Route
                          path="/settings/backup"
                          component={ BackupParameters }
                        />
                        <Route
                          path="/settings/weboob"
                          component={ WeboobParameters }
                        />
                        <Route
                          path="/settings/emails"
                          component={ EmailsParameters }
                        />
                    </Switch>
                </div>
            </div>
        </div>
    );
};

SettingsComponents.propTypes = {
    // Function to add an entry to the history. Automatically added by react-router;
    push: React.PropTypes.func.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: React.PropTypes.object.isRequired
};

export default SettingsComponents;
