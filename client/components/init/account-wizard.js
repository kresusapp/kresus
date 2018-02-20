import React from 'react';
import { Switch, Redirect, Route, Link } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import NewBankForm from '../settings/bank-accesses/form';
import ImportModule from '../settings/backup/import';
import LocaleSelector from '../menu/locale-selector';
import WeboobInstallReadme from './weboob-readme';

const PATH_PREFIX = '/initialize';

export default class AccountWizard extends React.Component {
    // TODO: Demo mode should be implemented
    renderMenu = () => (
        <div>
            <header>
                <LocaleSelector />
                <h1>{$t('client.accountwizard.welcome')}</h1>
            </header>
            <p>{$t('client.accountwizard.description')}</p>

            <nav className="init-panes">
                <Link to={`${PATH_PREFIX}/new-bank`}>
                    <h3>
                        <i className="fa fa-plus small-only" />
                        {$t('client.accountwizard.menu.add_first_access_title')}
                    </h3>
                    <div>
                        <p>
                            <i className="fa fa-plus" />
                        </p>
                        <p>{$t('client.accountwizard.menu.add_first_access_desc')}</p>
                    </div>
                    <p className="add-first-access-pane-button">
                        {$t('client.accountwizard.menu.add_first_access_action')}
                    </p>
                </Link>

                <Link to={`${PATH_PREFIX}/import`}>
                    <h3>
                        <i className="fa fa-download small-only" />
                        {$t('client.accountwizard.menu.import_title')}
                    </h3>
                    <div>
                        <p>
                            <i className="fa fa-download" />
                        </p>
                        <p>{$t('client.accountwizard.menu.import_desc')}</p>
                    </div>
                    <p className="import-pane-button">
                        {$t('client.accountwizard.menu.import_action')}
                    </p>
                </Link>

                <Link to={`${PATH_PREFIX}/demo-mode`} className="disabled">
                    <h3>
                        <i className="fa fa-laptop small-only" />
                        {$t('client.accountwizard.menu.demo_title')}
                    </h3>
                    <div>
                        <p>
                            <i className="fa fa-laptop" />
                        </p>
                        <p>{$t('client.accountwizard.menu.demo_desc')}</p>
                    </div>
                    <p className="demo-pane-button">
                        {$t('client.accountwizard.menu.demo_action')}
                    </p>
                </Link>
            </nav>
        </div>
    );

    renderNewBankForm = () => (
        <div className="accountwizard-newbank">
            <header>
                <h1>{$t('client.accountwizard.letsgo')}</h1>
            </header>
            <NewBankForm isOnboarding={true} />
            <Link className="btn btn-danger" to={`${PATH_PREFIX}/`}>
                {$t('client.general.cancel')}
            </Link>
        </div>
    );

    renderImport = () => (
        <div>
            <header>
                <h1>{$t('client.accountwizard.letsimport')}</h1>
            </header>

            <p>{$t('client.accountwizard.import')}</p>
            <div className="accountwizard-import">
                <div className="pull-right">
                    <ImportModule />
                </div>
                <div className="pull-left">
                    <Link className="btn btn-danger" to={`${PATH_PREFIX}/`} tabIndex="0">
                        {$t('client.general.cancel')}
                    </Link>
                </div>
            </div>
        </div>
    );

    renderDemoMode = () => (
        <div>
            <header>
                <h1>{$t('client.accountwizard.demomode')}</h1>
            </header>

            <p>{$t('client.accountwizard.demomode_description')}</p>

            <Link className="btn btn-danger" to={`${PATH_PREFIX}/`}>
                {$t('client.general.cancel')}
            </Link>
        </div>
    );

    renderWeboobReadme = () => <WeboobInstallReadme />;

    render() {
        return (
            <div className="wizard">
                <div className="wizard-content">
                    <div>
                        <Switch>
                            <Route
                                path={`${PATH_PREFIX}/new-bank`}
                                render={this.renderNewBankForm}
                            />
                            <Route path={`${PATH_PREFIX}/import`} render={this.renderImport} />
                            <Route path={`${PATH_PREFIX}/demo-mode`} render={this.renderDemoMode} />
                            <Route path={`${PATH_PREFIX}`} render={this.renderMenu} />
                            <Route path={'/weboob-readme'} render={this.renderWeboobReadme} />
                            <Redirect to={PATH_PREFIX} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
