import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, AlertTypes } from '../../../helpers';
import { get, actions } from '../../../store';

import AlertItem from './alert-item';
import { MODAL_SLUG } from './alert-form-modal';

const ShowAlertCreationModal = connect(
    null,
    (dispatch, props) => {
        return {
            onClick() {
                actions.showModal(dispatch, MODAL_SLUG, props.type);
            }
        };
    }
)(props => {
    return (
        <button className="fa fa-plus-circle" aria-label="create alert" onClick={props.onClick} />
    );
});

ShowAlertCreationModal.propTypes = {
    // The type of alert to create.
    type: PropTypes.oneOf(AlertTypes).isRequired
};

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
        <div className="panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">{$t(props.panelTitleKey)}</h3>

                <div className="panel-options">
                    <ShowAlertCreationModal type={props.alertType} />
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
