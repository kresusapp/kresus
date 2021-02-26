import React from 'react';

import { translate as $t, useKresusState } from '../../../helpers';
import { get } from '../../../store';

import AlertItem from './alert-item';
import { ButtonLink } from '../../ui';

import URL from './urls';

const AlertList = (props: {
    // The alert type.
    alertType: 'balance' | 'transaction';

    // Description of the type of alert.
    sendIfText: string;

    // The panel title translation key.
    panelTitleKey: string;

    // The panel description translation key.
    panelDescriptionKey: string;
}) => {
    const alerts = useKresusState(state => get.alerts(state, props.alertType));

    const items = alerts.map(pair => (
        <AlertItem
            key={pair.alert.id}
            alert={pair.alert}
            account={pair.account}
            sendIfText={props.sendIfText}
        />
    ));

    return (
        <table className="alerts-and-reports no-vertical-border">
            <caption>
                <div>
                    <h3>{$t(props.panelTitleKey)}</h3>
                    <div className="actions">
                        <ButtonLink
                            to={URL.newAlert.url(props.alertType)}
                            aria={`create ${props.alertType}`}
                            icon="plus-circle"
                        />
                    </div>
                </div>
            </caption>
            <tfoot className="alerts info">
                <tr>
                    <td colSpan={4}>{$t(props.panelDescriptionKey)}</td>
                </tr>
            </tfoot>
            <thead>
                <tr>
                    <th>{$t('client.settings.emails.account')}</th>
                    <th>{$t('client.settings.emails.details')}</th>
                    <th />
                    <th />
                </tr>
            </thead>
            <tbody>{items}</tbody>
        </table>
    );
};

AlertList.displayName = 'AlertList';

export default AlertList;
