import React from 'react';
import PropTypes from 'prop-types';

import URL from '../../urls';
import { translate as $t } from '../../helpers';

import BackupParameters from './backup';
import BankAccountsList from './bank-accesses';
import CustomizationParameters from './customization';
import EmailsParameters from './emails';
import LogsSection from './logs';
import WeboobParameters from './weboob';

import TabsContainer from '../ui/tabs.js';

const SettingsComponents = props => {
    let currentAccountId = URL.settings.accountId(props.match);

    let tabs = new Map();
    tabs.set(URL.settings.url('accounts', currentAccountId), {
        name: $t('client.settings.tab_accounts'),
        component: BankAccountsList
    });
    tabs.set(URL.settings.url('emails', currentAccountId), {
        name: $t('client.settings.tab_alerts'),
        component: EmailsParameters
    });
    tabs.set(URL.settings.url('backup', currentAccountId), {
        name: $t('client.settings.tab_backup'),
        component: BackupParameters
    });
    tabs.set(URL.settings.url('weboob', currentAccountId), {
        name: $t('client.settings.tab_weboob'),
        component: WeboobParameters
    });
    tabs.set(URL.settings.url('customization', currentAccountId), {
        name: $t('client.settings.tab_customization'),
        component: CustomizationParameters
    });
    tabs.set(URL.settings.url('logs', currentAccountId), {
        name: $t('client.settings.tab_logs'),
        component: LogsSection
    });

    return (
        <TabsContainer
            tabs={tabs}
            defaultTab={URL.settings.url('accounts', currentAccountId)}
            selectedTab={props.location.pathname}
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
