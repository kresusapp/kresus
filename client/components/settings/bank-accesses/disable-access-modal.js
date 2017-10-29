import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import { registerModal } from '../../ui/new-modal';
import CancelAndWarning from '../../ui/modal-cancel-and-warning-button';

const MODAL_SLUG = 'disable-access';

const Footer = connect(
    state => {
        return {
            accessId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ accessId }, { dispatch }) => {
        return {
            onClickWarning() {
                actions.disableAccess(dispatch, accessId);
            },
            warningLabel: $t('client.disableaccessmodal.confirm')
        };
    }
)(CancelAndWarning);

registerModal(MODAL_SLUG, () => {
    return {
        title: $t('client.disableaccessmodal.title'),
        body: $t('client.disableaccessmodal.body'),
        footer: <Footer />
    };
});

const DisableAccessButton = connect(null, (dispatch, props) => {
    return {
        handleShowDisableAccessModal: () => actions.showModal(dispatch, MODAL_SLUG, props.accessId)
    };
})(props => {
    return (
        <span
            className="option-legend fa fa-power-off enabled clickable"
            aria-label="Disable access"
            onClick={props.handleShowDisableAccessModal}
            title={$t('client.settings.disable_access')}
        />
    );
});
DisableAccessButton.propsTypes = {
    // The unique string id of the access to be disabled.
    accessId: PropTypes.string.isRequired
};
export default DisableAccessButton;
