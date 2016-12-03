import React from 'react';

import { assert, translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import DefaultParameters from './default-parameters';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';

export default class SettingsComponents extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: 'accounts'
        };

        this.handleTabChange = this.handleTabChange.bind(this);
    }

    show(which) {
        return () => {
            this.setState({
                showing: which
            });
        };
    }

    handleTabChange(event) {
        this.setState({
            showing: event.target.value
        });
    }

    render() {
        let self = this;
        function maybeActive(name) {
            return self.state.showing === name ? 'active' : '';
        }

        let Tab;
        switch (this.state.showing) {
            case 'accounts':
                Tab = <BankAccountsList />;
                break;
            case 'defaults':
                Tab = <DefaultParameters />;
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

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.settings.title') }
                        </h3>
                    </div>

                    <div className="panel-body">
                        <ul className="nav nav-pills hidden-xs">
                            <li
                              role="presentation"
                              className={ maybeActive('accounts') }>
                                <a
                                  href="#"
                                  onClick={ this.show('accounts') }>
                                    { $t('client.settings.tab_accounts') }
                                </a>
                            </li>
                            <li
                              role="presentation"
                              className={ maybeActive('emails') }>
                                <a
                                  href="#"
                                  onClick={ this.show('emails') }>
                                    { $t('client.settings.tab_alerts') }
                                </a>
                            </li>
                            <li
                              role="presentation"
                              className={ maybeActive('defaults') }>
                                <a
                                  href="#"
                                  onClick={ this.show('defaults') }>
                                    { $t('client.settings.tab_defaults') }
                                </a>
                            </li>
                            <li
                              role="presentation"
                              className={ maybeActive('backup') }>
                                <a
                                  href="#"
                                  onClick={ this.show('backup') }>
                                    { $t('client.settings.tab_backup') }
                                </a>
                            </li>
                            <li
                              role="presentation"
                              className={ maybeActive('weboob') }>
                                <a
                                  href="#"
                                  onClick={ this.show('weboob') }>
                                    { $t('client.settings.tab_weboob') }
                                </a>
                            </li>
                        </ul>

                        <select
                          className="settings-tab-selector visible-xs-*"
                          defaultValue={ self.state.showing }
                          onChange={ this.handleTabChange }>
                            <option value='accounts'>{ $t('client.settings.tab_accounts') }</option>
                            <option value='emails'>{ $t('client.settings.tab_alerts') }</option>
                            <option value='defaults'>{ $t('client.settings.tab_defaults') }</option>
                            <option value='backup'>{ $t('client.settings.tab_backup') }</option>
                            <option value='weboob'>{ $t('client.settings.tab_weboob') }</option>
                        </select>

                        { Tab }
                    </div>
                </div>
            </div>
        );
    }
}
