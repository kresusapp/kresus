import React from 'react';
import { Switch, Route, Redirect, NavLink } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import NewInitForm from './form';
import ImportModule from '../settings/backup/import';
import TabMenu from '../ui/tab-menu';
import LocaleSelector from '../menu/locale-selector';

const PATH_PREFIX = '/initialize';

export default class AccountWizard extends React.Component {
    constructor(props) {
        super(props);
    }

    renderInitForm = () => (
        <NewInitForm />
    );

    renderMenu = () => (
        <div>
            <p>{$t('client.accountwizard.welcome')}</p>
            <p>{$t('client.accountwizard.description')}</p>

            <nav className="init-wells">
                <NavLink to={`${PATH_PREFIX}/new-bank`} activeClassName="active" className="well" style={{ backgroundColor: "rgb(0, 191, 243)" }}>
                    <span className="well-icon">
                        <i className="fa fa-plus" />
                    </span>
                    <span className="well-title">
                        {$t('client.accountwizard.menu.add_first_access_title')}
                    </span>
                    <br />
                    <span className="well-sub">
                        {$t('client.accountwizard.menu.add_first_access_desc')}
                    </span>
                </NavLink>

                <NavLink to={`${PATH_PREFIX}/import`} activeClassName="active" className="well" style={{ backgroundColor: "rgb(0, 166, 81)" }}>
                    <span className="well-icon">
                        <i className="fa fa-upload" />
                    </span>
                    <span className="well-title">
                        {$t('client.accountwizard.menu.import_title')}
                    </span>
                    <br />
                    <span className="well-sub">
                        {$t('client.accountwizard.menu.import_desc')}
                    </span>
                </NavLink>

                <NavLink to={`${PATH_PREFIX}/demo-mode`} activeClassName="active" className="well" style={{ backgroundColor: "rgb(242, 108, 79)" }}>
                    <span className="well-icon">
                        <i className="fa fa-laptop" />
                    </span>
                    <span className="well-title">
                        {$t('client.accountwizard.menu.demo_title')}
                    </span>
                    <br />
                    <span className="well-sub">
                        {$t('client.accountwizard.menu.demo_desc')}
                    </span>
                </NavLink>
            </nav>
        </div>
    );

    renderImport = () => (
        <div>
            <p>{$t('client.accountwizard.import')}</p>
            <div className="accountwizard-import">
                <ImportModule />
            </div>
        </div>
    );

    render() {
        return (
            <div className="wizard">
                <div className="wizard-content panel">
                    <header className="panel-heading">
                        <h1 className="panel-title">{$t('client.accountwizard.title')}</h1>
                        <LocaleSelector />
                    </header>
                    <div className="panel-body">
                        <Switch>
                            <Route path={`${PATH_PREFIX}/new-bank`} render={this.renderInitForm} />
                            <Route path={`${PATH_PREFIX}/import`} render={this.renderImport} />
                            <Route path={`${PATH_PREFIX}`} render={this.renderMenu} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
