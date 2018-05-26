import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import { registerModal } from '../../ui/modal';
import CancelAndWarning from '../../ui/modal/cancel-and-warning-buttons';
import ModalContent from '../../ui/modal/content';

const MODAL_SLUG = 'disable-access';

const DisableAccessModal = connect(
    state => {
        return {
            accessId: get.modal(state).state
        };
    },
    dispatch => {
        return {
            makeHandleClickWarning(accessId) {
                actions.disableAccess(dispatch, accessId);
            }
        };
    },
    ({ accessId }, { makeHandleClickWarning }) => {
        return {
            handleClickWarning() {
                makeHandleClickWarning(accessId);
            }
        };
    }
)(props => {
    const footer = (
        <CancelAndWarning
            onClickWarning={props.handleClickWarning}
            warningLabel={$t('client.disableaccessmodal.confirm')}
        />
    );

    return (
        <ModalContent
            title={$t('client.disableaccessmodal.title')}
            body={$t('client.disableaccessmodal.body')}
            footer={footer}
        />
    );
});

registerModal(MODAL_SLUG, () => <DisableAccessModal />);

const DisableAccessButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick: () => actions.showModal(dispatch, MODAL_SLUG, props.accessId)
        };
    }
)(props => {
    return (
        <button
            className="fa fa-power-off enabled"
            aria-label="Disable access"
            onClick={props.handleClick}
            title={$t('client.settings.disable_access')}
        />
    );
});
DisableAccessButton.propsTypes = {
    // The unique string id of the access to be disabled.
    accessId: PropTypes.string.isRequired
};
export default DisableAccessButton;
