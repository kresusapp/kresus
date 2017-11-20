import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import ImportModule from '../settings/backup/import';
import NewBankForm from '../settings/bank-accesses/form';
import WeboobParameters from '../settings/weboob';
import TabMenu from '../ui/tab-menu.js';

export default class AccountWizard extends React.Component {
    renderBankForm = () => <NewBankForm expanded={true} />;

    renderImport = () => (
        <div>
            <p>{$t('client.accountwizard.import')}</p>
            <ImportModule />
        </div>
    );

    render() {
        let pathPrefix = '/initialize';
        let menuItems = new Map();

        menuItems.set(`${pathPrefix}/new-bank`, $t('client.settings.new_bank_form_title'));
        menuItems.set(`${pathPrefix}/import`, $t('client.accountwizard.import_title'));
        menuItems.set(`${pathPrefix}/advanced`, $t('client.accountwizard.advanced'));

        return (
            <div className="wizard panel panel-default">
                <div className="panel-heading">
                    <h1 className="panel-title">{$t('client.accountwizard.title')}</h1>
                </div>
                <div className="panel-body">
                    <p>{$t('client.accountwizard.content')}</p>
                    <TabMenu
                        selected={this.props.location.pathname}
                        tabs={menuItems}
                        history={this.props.history}
                        location={this.props.location}
                    />
                    <Switch>
                        <Route path={`${pathPrefix}/new-bank`} render={this.renderBankForm} />
                        <Route path={`${pathPrefix}/import`} render={this.renderImport} />
                        <Route path={`${pathPrefix}/advanced`} component={WeboobParameters} />
                        <Redirect to={`${pathPrefix}/new-bank`} push={false} />
                    </Switch>
                </div>
            </div>
        );
    }
}
