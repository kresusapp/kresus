import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { translate as $t } from '../../helpers';

import ImportModule from '../settings/backup/import';
import InitForm from './initform';
import WeboobParameters from '../settings/weboob';
import TabMenu from '../ui/tab-menu.js';

export default props => {
    let pathPrefix = '/initialize';
    let menuItems = new Map();

    menuItems.set(`${pathPrefix}/new-bank`, $t('client.settings.new_bank_form_title'));
    menuItems.set(`${pathPrefix}/import`, $t('client.accountwizard.import_title'));

    const renderBankForm = () => <InitForm expanded={ true } />;

    const renderImport = () => (
        <div>
            <p>
                { $t('client.accountwizard.import') }
            </p>
            <ImportModule />
        </div>
    );

    return (
        <div className="wizard panel panel-default" style={{"max-width": "800px", "margin": "auto", "margin-top": "1em"}}>
            <div className="panel-heading" style={{"background-color": "#2c333f", "color": "white"}}>
                <h1 className="panel-title">
                    { $t('client.accountwizard.title') }
                </h1>
            </div>
            <div className="panel-body">
                <div style={{"display": "inline-block", "max-width": "75%", "vertical-align": "middle"}}>
                    <p>
                        { $t('client.accountwizard.subtitle') }
                    </p>
                    <p>
                        { $t('client.accountwizard.content') }
                    </p>
                    <p>
                        { $t('client.accountwizard.letsgo') }
                    </p>
                </div>
                <div style={{"display": "inline-block", "max-width": "25%", "text-align": "center"}}>
                    <p>
                        <img style={{"max-width": "50%", "border-radius": "100%", "height": "auto"}} src="http://localhost:9876/images/favicon/apple-touch-icon-180x180.png"/>
                    </p>
                </div>
                <TabMenu
                  selected={ props.location.pathname }
                  tabs={ menuItems }
                  history={ props.history }
                  location={ props.location }
                />
                <Switch>
                    <Route
                      path={ `${pathPrefix}/new-bank` }
                      render={ renderBankForm }
                    />
                    <Route
                      path={ `${pathPrefix}/import` }
                      render={ renderImport }
                    />
                    <Redirect
                      to={ `${pathPrefix}/new-bank` }
                      push={ false }
                    />
                </Switch>
            </div>
        </div>
    );
};
