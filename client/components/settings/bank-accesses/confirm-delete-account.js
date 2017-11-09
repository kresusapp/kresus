import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/new-modal';
import ModalContent from '../../ui/modal-content';
import CancelAndDelete from '../../ui/modal-cancel-and-delete-button';

const MODAL_SLUG = 'confirm-delete-account';

const ConfirmDeleteModal = connect(
    state => {
        let accountId = get.modal(state).state;
        let account = get.accountById(state, accountId);
        let title = account ? account.title : null;
        return {
            accountId,
            title
        };
    },
    dispatch => {
        return {
            makeHandleDelete(accountId) {
                actions.deleteAccount(dispatch, accountId);
            }
        };
    },
    ({ title, accountId }, { makeHandleDelete }) => {
        return {
            title,
            accountId,
            handleDelete() {
                makeHandleDelete(accountId);
            }
        };
    }
)(props => {
    return (
        <ModalContent
            title={$t('client.confirmdeletemodal.title')}
            body={$t('client.settings.erase_account', { title: props.title })}
            footer={<CancelAndDelete onClickDelete={props.handleDelete} />}
        />
    );
});
registerModal(MODAL_SLUG, <ConfirmDeleteModal />);

const DeleteAccountButton = connect(null, (dispatch, props) => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, props.accountId);
        }
    };
})(props => {
    return (
        <span
            className="pull-right fa fa-times-circle"
            aria-label="remove"
            onClick={props.handleClick}
            title={$t('client.settings.delete_account_button')}
        />
    );
});

DeleteAccountButton.propTypes = {
    // The account's unique id
    accountId: PropTypes.string.isRequired
};

export default DeleteAccountButton;
