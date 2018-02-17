import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import NewBankForm from '../settings/bank-accesses/form';
import ImportModule from '../settings/backup/import';
import LocaleSelector from '../menu/locale-selector';

const PATH_PREFIX = '/initialize';

export default class AccountWizard extends React.Component {
    handleNewBankClick = () => this.props.history.push(`${PATH_PREFIX}/new-bank`);
    handleImportClick = () => this.props.history.push(`${PATH_PREFIX}/import`);
    handleDemoClick = () => this.props.history.push(`${PATH_PREFIX}/demo-mode`);

    // TODO: Demo mode should be implemented
    renderMenu = () => (
        <div>
            <header>
                <LocaleSelector />
                <h1>{$t('client.accountwizard.welcome')}</h1>
            </header>
            <p>{$t('client.accountwizard.description')}</p>

            <nav className="init-panes">
                <div onClick={this.handleNewBankClick}>
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
                        <Link to={`${PATH_PREFIX}/new-bank`}>
                            {$t('client.accountwizard.menu.add_first_access_action')}
                        </Link>
                    </p>
                </div>

                <div onClick={this.handleImportClick}>
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
                        <Link to={`${PATH_PREFIX}/import`}>
                            {$t('client.accountwizard.menu.import_action')}
                        </Link>
                    </p>
                </div>

                <div onClick={this.handleDemoClick} className="disabled">
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
                        <Link to={`${PATH_PREFIX}/demo-mode`}>
                            {$t('client.accountwizard.menu.demo_action')}
                        </Link>
                    </p>
                </div>
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
                <Link className="btn btn-danger pull-left" to={`${PATH_PREFIX}/`}>
                    {$t('client.general.cancel')}
                </Link>
                <ImportModule />
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
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
