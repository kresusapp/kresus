import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';
import { get } from '../../../store';

import AlertItem from './alert-item';
import ShowAlertCreationModal from './alert-form-modal';

const Alerts = props => {
    let items = props.alerts.map(pair => (
        <AlertItem
            key={pair.alert.id}
            alert={pair.alert}
            account={pair.account}
            sendIfText={props.sendIfText}
        />
    ));

    return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">{$t(props.panelTitleKey)}</h3>

                <div className="panel-options">
                    <ShowAlertCreationModal alertType={props.alertType} />
                </div>
            </div>

            <p className="panel-body alert-info">{$t(props.panelDescriptionKey)}</p>

            <div className="table-responsive">
                <table className="table">
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
            </div>
        </div>
    );
};

Alerts.propTypes = {
    // The alert type
    alertType: PropTypes.string.isRequired,

    // Description of the type of alert
    sendIfText: PropTypes.string.isRequired,

    // The panel title translation key
    panelTitleKey: PropTypes.string.isRequired,

    // The panel description translation key
    panelDescriptionKey: PropTypes.string.isRequired,

    // The existing alerts
    alerts: PropTypes.array.isRequired
};

const Export = connect((state, props) => {
    return {
        alerts: get.alerts(state, props.alertType)
    };
})(Alerts);

export default Export;
