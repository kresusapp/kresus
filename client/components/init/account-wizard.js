import React from 'react';
import { Switch, Redirect, Route, Link } from 'react-router-dom';

import { translate as $t } from '../../helpers';
import URL from '../../urls';

import NewAccessForm from '../settings/bank-accesses/new-access-form';
import ImportModule from '../settings/backup/import';
import LocaleSelector from '../settings/customization/locale-selector';

import Demo from './demo';
import WeboobInstallReadme from './weboob-readme';

const BASE_PATH = URL.initialize.url();
const NEW_BANK_PATH = URL.initialize.url('new-bank');
const IMPORT_PATH = URL.initialize.url('import');
const DEMO_PATH = URL.initialize.url('demo-mode');

const NewAccessPane = () => {
    return (
        <div className="accountwizard-newbank">
            <header>
                <h1>{$t('client.accountwizard.letsgo')}</h1>
            </header>
            <NewAccessForm isOnboarding={true} />
            <Link className="btn danger" to={BASE_PATH}>
                {$t('client.general.cancel')}
            </Link>
        </div>
    );
};

const ImportPane = () => {
    let cancelButton = (
        <Link className="btn danger" to={BASE_PATH} tabIndex="0">
            {$t('client.general.cancel')}
        </Link>
    );
    return (
        <div>
            <header>
                <h1>{$t('client.accountwizard.letsimport')}</h1>
            </header>
            <p>{$t('client.accountwizard.import')}</p>
            <ImportModule cancelButton={cancelButton} dontResetOnSubmit={true} />
        </div>
    );
};

const Menu = () => (
    <div>
        <header>
            <LocaleSelector />
            <h1>{$t('client.accountwizard.welcome')}</h1>
        </header>
        <p>{$t('client.accountwizard.description')}</p>

        <nav className="init-panes">
            <Link to={NEW_BANK_PATH}>
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

            <Link to={IMPORT_PATH}>
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

            <Link to={DEMO_PATH}>
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
                <p className="demo-pane-button">{$t('client.accountwizard.menu.demo_action')}</p>
            </Link>
        </nav>
    </div>
);

const Onboarding = () => {
    return (
        <div className="wizard">
            <div className="wizard-content">
                <div>
                    <Switch>
                        <Route path={NEW_BANK_PATH}>
                            <NewAccessPane />
                        </Route>
                        <Route path={IMPORT_PATH}>
                            <ImportPane />
                        </Route>
                        <Route path={DEMO_PATH}>
                            <Demo />
                        </Route>
                        <Route path={BASE_PATH}>
                            <Menu />
                        </Route>
                        <Route path={URL.weboobReadme.url()}>
                            <WeboobInstallReadme />
                        </Route>
                        <Redirect to={BASE_PATH} />
                    </Switch>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
