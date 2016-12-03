import React from 'react';

import { assert, translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';

import TabMenu from '../ui/tab-menu.js';

export default class SettingsComponents extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: 'accounts'
        };

        this.handleTabChange = this.handleTabChange.bind(this);
    }

    handleTabChange(tabId) {
        this.setState({
            showing: tabId
        });
    }

    render() {
        let Tab;
        switch (this.state.showing) {
            case 'accounts':
                Tab = <BankAccountsList />;
                break;
            case 'backup':
                Tab = <BackupParameters />;
                break;
            case 'weboob':
                Tab = <WeboobParameters />;
                break;
            case 'emails':
                Tab = <EmailsParameters />;
                break;
            default:
                assert(false, 'unknown state to show in settings');
        }

        let menuItems = new Map();
        menuItems.set('accounts', $t('client.settings.tab_accounts'));
        menuItems.set('emails', $t('client.settings.tab_alerts'));
        menuItems.set('backup', $t('client.settings.tab_backup'));
        menuItems.set('weboob', $t('client.settings.tab_weboob'));

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
                          defaultValue={ this.state.showing }
                          tabs={ menuItems }
                        />

                        { Tab }
                    </div>
                </div>
            </div>
        );
    }
}
