import React from 'react';
import { NavLink } from 'react-router-dom';

import URL from '../../urls';
import { translate as $t } from '../../helpers';

import DisplayIf from '../ui/display-if';

class DropdownContent extends React.PureComponent {
    componentDidMount() {
        document.addEventListener('keydown', this.props.onKeydown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.props.onKeydown);
    }

    render() {
        return (
            <div id={this.props.id} onClick={this.props.onClick}>
                {this.props.children}
            </div>
        );
    }
}

export default class DropdownMenu extends React.PureComponent {
    state = {
        show: false
    };

    handleHide = () => {
        this.setState({ show: false });
    };

    handleToggle = () => {
        this.setState({ show: !this.state.show });
    };

    handleKeydown = event => {
        if (event.key === 'Escape') {
            this.handleHide();
        }
    };

    render() {
        return (
            <div className="settings-dropdown">
                <button className="fa fa-cogs" onClick={this.handleToggle} />
                <DisplayIf condition={this.state.show}>
                    <DropdownContent
                        id="overlay"
                        onKeydown={this.handleKeydown}
                        onClick={this.handleHide}>
                        <nav className="settings-dropdown-menu">
                            <ul>
                                <li>
                                    <NavLink
                                        to={URL.settings.url(
                                            'categories',
                                            this.props.currentAccountId
                                        )}>
                                        <span className="fa fa-list-ul" />
                                        {$t('client.menu.categories')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={URL.settings.url(
                                            'accounts',
                                            this.props.currentAccountId
                                        )}>
                                        <span className="fa fa-bank" />
                                        {$t('client.settings.tab_accounts')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={URL.settings.url(
                                            'emails',
                                            this.props.currentAccountId
                                        )}>
                                        <span className="fa fa-envelope" />
                                        {$t('client.settings.tab_alerts')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={URL.settings.url(
                                            'backup',
                                            this.props.currentAccountId
                                        )}>
                                        <span className="fa fa-save" />
                                        {$t('client.settings.tab_backup')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={URL.settings.url(
                                            'weboob',
                                            this.props.currentAccountId
                                        )}>
                                        <span className="fa fa-plug" />
                                        {$t('client.settings.tab_weboob')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={URL.settings.url(
                                            'customization',
                                            this.props.currentAccountId
                                        )}>
                                        <span className="fa fa-paint-brush" />
                                        {$t('client.settings.tab_customization')}
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to={URL.settings.url('logs', this.props.currentAccountId)}>
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
                        </nav>
                    </DropdownContent>
                </DisplayIf>
            </div>
        );
    }
}
