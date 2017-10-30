import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { getWellsColors, translate as $t } from '../../helpers';

import NewInitForm from './form';
import ImportModule from '../settings/backup/import';
import LocaleSelector from '../menu/locale-selector';

const PATH_PREFIX = '/initialize';

export default class AccountWizard extends React.Component {
    renderInitForm = () => <NewInitForm />;

    handleNewBankClick = () => this.props.history.push(`${PATH_PREFIX}/new-bank`);
    handleImportClick = () => this.props.history.push(`${PATH_PREFIX}/import`);
    handleDemoClick = () => this.props.history.push(`${PATH_PREFIX}/demo-mode`);

    renderMenu = () => {
        let wellsColors = getWellsColors();

        return (
            <div>
                <header>
                    <LocaleSelector />
                    <h1>{$t('client.accountwizard.welcome')}</h1>
                </header>
                <p>{$t('client.accountwizard.description')}</p>

                <nav className="init-wells">
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
                        <p style={{ backgroundColor: wellsColors.RECEIVED }}>
                            <Link to={`${PATH_PREFIX}/new-bank`}>
                                {$t('client.accountwizard.menu.add_first_access_action')}
                            </Link>
                        </p>
                    </div>

                    <div onClick={this.handleImportClick}>
                        <h3>
                            <i className="fa fa-upload small-only" />
                            {$t('client.accountwizard.menu.import_title')}
                        </h3>
                        <div>
                            <p>
                                <i className="fa fa-download" />
                            </p>
                            <p>{$t('client.accountwizard.menu.import_desc')}</p>
                        </div>
                        <p style={{ backgroundColor: wellsColors.SAVED }}>
                            <Link to={`${PATH_PREFIX}/import`}>
                                {$t('client.accountwizard.menu.import_action')}
                            </Link>
                        </p>
                    </div>

                    <div onClick={this.handleDemoClick}>
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
                        <p style={{ backgroundColor: '#dbae34' }}>
                            <Link to={`${PATH_PREFIX}/demo-mode`}>
                                {$t('client.accountwizard.menu.demo_action')}
                            </Link>
                        </p>
                    </div>
                </nav>
            </div>
        );
    };

    renderImport = () => (
        <div>
            <header>
                <h1>{$t('client.accountwizard.letsimport')}</h1>
            </header>

            <p>{$t('client.accountwizard.import')}</p>
            <div className="accountwizard-import">
                <ImportModule />
            </div>
        </div>
    );

    render() {
        return (
            <div className="wizard">
                <div className="wizard-content">
                    <div>
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
