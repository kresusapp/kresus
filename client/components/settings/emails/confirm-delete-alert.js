import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/new-modal';

const MODAL_SLUG = 'confirm-delete-alert';

const Body = connect(state => {
    return {
        type: get.modal(state).state.type
    };
})(props => {
    return <span>{$t(`client.settings.emails.delete_${props.type}_full_text`)}</span>;
});

const Footer = connect(
    state => {
        return {
            alertId: get.modal(state).state.alertId
        };
    },
    dispatch => ({ dispatch }),
    ({ alertId }, { dispatch }) => {
        return {
            handleCancel() {
                actions.hideModal(dispatch);
            },
            handleDelete() {
                actions.deleteAlert(dispatch, alertId);
            }
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button type="button" className="btn btn-danger" onClick={props.handleDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </div>
    );
});

registerModal(MODAL_SLUG, () => {
    return {
        title: $t('client.confirmdeletemodal.title'),
        body: <Body />,
        footer: <Footer />
    };
});

const DeleteAlertButton = connect(null, (dispatch, props) => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, { alertId: props.alertId, type: props.type });
        }
    };
})(props => {
    return (
        <span
            className="pull-right fa fa-times-circle"
            aria-label="remove alert/report"
            onClick={props.handleClick}
            title={$t(`client.settings.emails.delete_${props.type}`)}
        />
    );
});

DeleteAlertButton.propTypes = {
    // The account's unique id
    alertId: PropTypes.string.isRequired,

    // The type of alert
    type: PropTypes.oneOf(['alert', 'report']).isRequired
};

export default DeleteAlertButton;
