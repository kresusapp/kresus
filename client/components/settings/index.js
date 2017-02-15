import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';

import TabMenu from '../ui/tab-menu.js';

export default class SettingsComponents extends React.Component {

    constructor(props) {
        super(props);

        this.handleTabChange = this.handleTabChange.bind(this);
    }

    handleTabChange(tabId) {
        this.props.push(tabId);
    }

    render() {
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
                          onChange={ this.handleTabChange }
                          defaultValue={ '/settings/accounts' }
                          tabs={ menuItems }
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
    }
}
