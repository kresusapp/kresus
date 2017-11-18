import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/new-modal';
import ModalContent from '../../ui/modal-content';
import CancelAndDelete from '../../ui/modal-cancel-and-delete-button';

const MODAL_SLUG = 'confirm-delete-access';

const ConfirmDeleteModal = connect(
    state => {
        let accessId = get.modal(state).state;
        let access = get.accessById(state, accessId);
        let name = access ? access.name : null;
        return {
            name,
            accessId
        };
    },
    dispatch => {
        return {
            makeHandleDelete(accessId) {
                actions.deleteAccess(dispatch, accessId);
            }
        };
    },
    ({ name, accessId }, { makeHandleDelete }) => {
        return {
            name,
            handleDelete() {
                makeHandleDelete(accessId);
            }
        };
    }
)(props => {
    return (
        <ModalContent
            title={$t('client.confirmdeletemodal.title')}
            body={$t('client.settings.erase_access', { name: props.name })}
            footer={<CancelAndDelete onClickDelete={props.handleDelete} />}
        />
    );
});

registerModal(MODAL_SLUG, <ConfirmDeleteModal />);

const DeleteAccessButton = connect(null, (dispatch, props) => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, props.accessId);
        }
    };
})(props => {
    return (
        <span
            className="option-legend fa fa-times-circle"
            aria-label="remove access"
            onClick={props.handleClick}
            title={$t('client.settings.delete_access_button')}
        />
    );
});

DeleteAccessButton.propTypes = {
    // The account's unique id
    accessId: PropTypes.string.isRequired
};

export default DeleteAccessButton;
