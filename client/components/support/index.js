import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

import { KresusDetails } from '../menu/about';
import dependenciesLicenses from './dependenciesLicenses.json';

const SupportComponents = props => {
    const pathPrefix = '/support';

    let menuItems = new Map();
    menuItems.set(`${pathPrefix}/accounts/`, $t('client.settings.tab_accounts'));

    let thanksItems = [];
    Object.keys(dependenciesLicenses).sort().forEach(dep => {
        let maybeDepLink = dep;
        if (dependenciesLicenses[dep].website) {
            maybeDepLink = <a href={dependenciesLicenses[dep].website}>{dep}</a>;
        }

        thanksItems.push(
            <li key={dep}>{maybeDepLink} ({ $t('client.support.license', { license: dependenciesLicenses[dep].license }) })</li>
        );
    });

    return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">{$t('client.support.title')}</h3>
            </div>

            <div className="panel-body">
                <div>
                    <KresusDetails />
                </div>

                <h3>{ $t('client.support.thanks') }</h3>
                <p>{ $t('client.support.thanks_description') }</p>
                <ul>
                    { thanksItems }
                </ul>
            </div>
        </div>
    );
};

SupportComponents.propTypes = {
    // The history object, providing access to the history API.
    // Automatically added by the Route component.
    history: PropTypes.object.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: PropTypes.object.isRequired
};

export default SupportComponents;
