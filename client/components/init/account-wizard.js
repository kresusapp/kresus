import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import ImportModule from '../settings/backup/import';
import NewBankForm from '../settings/bank-accesses/form';
import WeboobParameters from '../settings/weboob';
import TabMenu from '../ui/tab-menu.js';
import LocaleSelector from '../menu/locale-selector';

const PATH_PREFIX = '/initialize';

export default class AccountWizard extends React.Component {
    constructor(props) {
        super(props);
        this.menuItems = new Map();
        this.menuItems.set(`${PATH_PREFIX}/new-bank`, $t('client.settings.new_bank_form_title'));
        this.menuItems.set(`${PATH_PREFIX}/import`, $t('client.accountwizard.import_title'));
        this.menuItems.set(`${PATH_PREFIX}/advanced`, $t('client.accountwizard.advanced'));
    }

    renderBankForm = () => <NewBankForm expanded={true} />;

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
                        <p>{$t('client.accountwizard.welcome')}</p>
                        <p>{$t('client.accountwizard.description')}</p>
                        <p>{$t('client.accountwizard.letsgo')}</p>
                        <TabMenu
                            selected={this.props.location.pathname}
                            tabs={this.menuItems}
                            history={this.props.history}
                            location={this.props.location}
                        />
                        <Switch>
                            <Route path={`${PATH_PREFIX}/new-bank`} render={this.renderBankForm} />
                            <Route path={`${PATH_PREFIX}/import`} render={this.renderImport} />
                            <Route path={`${PATH_PREFIX}/advanced`} component={WeboobParameters} />
                            <Redirect to={`${PATH_PREFIX}/new-bank`} push={false} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
