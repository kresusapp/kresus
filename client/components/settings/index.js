import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

import BankAccountsList from './bank-accesses';
import BackupParameters from './backup';
import EmailsParameters from './emails';
import WeboobParameters from './weboob';
import ThemesParameters from './themes';
import LogsSection from './logs';

import TabsContainer from '../ui/tabs.js';

const SettingsComponents = props => {
    const pathPrefix = '/settings';

    let { currentAccountId } = props.match.params;

    let tabs = new Map();
    tabs.set(`${pathPrefix}/accounts/${currentAccountId}`, {
        name: $t('client.settings.tab_accounts'),
        component: BankAccountsList
    });
    tabs.set(`${pathPrefix}/emails/${currentAccountId}`, {
        name: $t('client.settings.tab_alerts'),
        component: EmailsParameters
    });
    tabs.set(`${pathPrefix}/backup/${currentAccountId}`, {
        name: $t('client.settings.tab_backup'),
        component: BackupParameters
    });
    tabs.set(`${pathPrefix}/weboob/${currentAccountId}`, {
        name: $t('client.settings.tab_weboob'),
        component: WeboobParameters
    });
    tabs.set(`${pathPrefix}/themes/${currentAccountId}`, {
        name: $t('client.settings.tab_themes'),
        component: ThemesParameters
    });
    tabs.set(`${pathPrefix}/logs/${currentAccountId}`, {
        name: $t('client.settings.tab_logs'),
        component: LogsSection
    });

    return (
        <TabsContainer
            tabs={tabs}
            defaultTab={`${pathPrefix}/accounts/${currentAccountId}`}
            selectedTab={props.location.hostname}
            history={props.history}
            location={props.location}
        />
    );
};

SettingsComponents.propTypes = {
    // The history object, providing access to the history API.
    // Automatically added by the Route component.
    history: PropTypes.object.isRequired,

    // Location object (contains the current path). Automatically added by react-router.
    location: PropTypes.object.isRequired
};

export default SettingsComponents;
