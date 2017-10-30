import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import NewInitForm from './form';
import ImportModule from '../settings/backup/import';
import WeboobParameters from '../settings/weboob';
import TabMenu from '../ui/tab-menu.js';
import LocaleSelector from '../menu/locale-selector';

export default props => {
    let pathPrefix = '/initialize';
    let menuItems = new Map();

    menuItems.set(`${pathPrefix}/new-bank`, $t('client.settings.new_bank_form_title'));
    menuItems.set(`${pathPrefix}/import`, $t('client.accountwizard.import_title'));

    const renderInitForm = () => <NewInitForm expanded={true} />;

    const renderImport = () => (
        <div>
            <p>{$t('client.accountwizard.import')}</p>
            <ImportModule />
        </div>
    );

    return (
        <div className="wizard">
            <div className="wizard-content panel">
                <header className="panel-heading">
                    <h1 className="panel-title">{$t('client.accountwizard.title')}</h1>

                    <LocaleSelector />
                </header>
                <div className="panel-body">
                    <p>{$t('client.accountwizard.welcome')}</p>
                    <p>{$t('client.accountwizard.description')}</p>
                    <p>{$t('client.accountwizard.letsgo')}</p>
                    <TabMenu
                        selected={props.location.pathname}
                        tabs={menuItems}
                        history={props.history}
                        location={props.location}
                    />
                    <Switch>
                        <Route path={`${pathPrefix}/new-bank`} render={renderInitForm} />
                        <Route path={`${pathPrefix}/import`} render={renderImport} />
                        <Redirect to={`${pathPrefix}/new-bank`} push={false} />
                    </Switch>
                </div>
            </div>
        </div>
    );
};
