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
            <nav>
                <ul className="wizard-menu fa-ul">
                    <li>
                        <i className="fa-li fa fa-plus" aria-hidden="true"></i>
                        <NavLink to={`${PATH_PREFIX}/new-bank`} activeClassName="active">
                            {$t('client.accountwizard.menu.add_first_access')}
                        </NavLink>
                    </li>
                    <li>
                        <i className="fa-li fa fa-upload" aria-hidden="true"></i>
                        <NavLink to={`${PATH_PREFIX}/import`} activeClassName="active">
                            {$t('client.accountwizard.menu.import')}
                        </NavLink>
                    </li>
                    <li>
                        <i className="fa-li fa fa-laptop" aria-hidden="true"></i>
                        <NavLink to={`${PATH_PREFIX}/demo-mode`} activeClassName="active">
                            {$t('client.accountwizard.menu.demo')}
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );

    renderImport = () => (
        <div>
            <p>{$t('client.accountwizard.import')}</p>
            <ImportModule />
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
