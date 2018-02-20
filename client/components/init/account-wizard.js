import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { getWellsColors, translate as $t } from '../../helpers';

import NewBankForm from '../settings/bank-accesses/form';
import ImportModule from '../settings/backup/import';
import LocaleSelector from '../menu/locale-selector';
import WeboobInstallReadme from './weboob-readme';

const PATH_PREFIX = '/initialize';

export default class AccountWizard extends React.Component {
    renderBankForm = () => (
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
                        <p style={{ backgroundColor: wellsColors.RECEIVED }}>
                            {$t('client.accountwizard.menu.add_first_access_action')}
                        </p>
                    </Link>

                    <Link to={`${PATH_PREFIX}/import`}>
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
                            {$t('client.accountwizard.menu.import_action')}
                        </p>
                    </Link>

                    <Link to={`${PATH_PREFIX}/demo-mode`}>
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
                            {$t('client.accountwizard.menu.demo_action')}
                        </p>
                    </Link>
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
                <div className="pull-left">
                    <ImportModule />
                </div>
                <Link className="btn btn-danger" to={`${PATH_PREFIX}/`}>
                    {$t('client.general.cancel')}
                </Link>
            </div>
        </div>
    );

    renderWeboobReadme = () => <WeboobInstallReadme />;

    render() {
        return (
            <div className="wizard">
                <div className="wizard-content">
                    <div>
                        <Switch>
                            <Route path={`${PATH_PREFIX}/new-bank`} render={this.renderBankForm} />
                            <Route path={`${PATH_PREFIX}/import`} render={this.renderImport} />
                            <Route path={`${PATH_PREFIX}`} render={this.renderMenu} />
                            <Route path={'/weboob-readme'} render={this.renderWeboobReadme} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
