import React from 'react';
import ReactDOM from 'react-dom';
import { NavLink } from 'react-router-dom';

import URL from '../../urls';
import { translate as $t } from '../../helpers';

class ParamMenu extends React.Component {
    onKeydownHandler = event => {
        if (event.key === 'Escape') {
            this.props.onClick();
        }
    };

    componentDidMount() {
        document.addEventListener('keydown', this.onKeydownHandler);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeydownHandler);
    }

    render() {
        const modal = (
            <div id="overlay" onClick={this.props.onClick}>
                <div className="settings-dropdown-menu">
                    <ul>
                        <li>
                            <NavLink
                                to={URL.settings.url('categories', this.props.currentAccountId)}>
                                <span className="fa fa-list-ul" />
                                {$t('client.menu.categories')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={URL.settings.url('accounts', this.props.currentAccountId)}>
                                <span className="fa fa-bank" />
                                {$t('client.settings.tab_accounts')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={URL.settings.url('emails', this.props.currentAccountId)}>
                                <span className="fa fa-envelope" />
                                {$t('client.settings.tab_alerts')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={URL.settings.url('backup', this.props.currentAccountId)}>
                                <span className="fa fa-save" />
                                {$t('client.settings.tab_backup')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={URL.settings.url('weboob', this.props.currentAccountId)}>
                                <span className="fa fa-plug" />
                                {$t('client.settings.tab_weboob')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={URL.settings.url('customization', this.props.currentAccountId)}>
                                <span className="fa fa-paint-brush" />
                                {$t('client.settings.tab_customization')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={URL.settings.url('logs', this.props.currentAccountId)}>
                                <span className="fa fa-file-text" />
                                {$t('client.settings.tab_logs')}
                            </NavLink>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <NavLink to={URL.about.url(this.props.currentAccountId)}>
                                <span className="fa fa-question" />
                                {$t('client.menu.about')}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        );

        return ReactDOM.createPortal(modal, document.getElementById('portal'));
    }
}

export default ParamMenu;
