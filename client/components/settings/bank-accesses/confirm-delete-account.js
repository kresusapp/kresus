import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, displayLabel } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/modal';
import ModalContent from '../../ui/modal/content';
import CancelAndDelete from '../../ui/modal/cancel-and-delete-buttons';

export const DELETE_ACCOUNT_MODAL_SLUG = 'confirm-delete-account';

const ConfirmDeleteModal = connect(
    state => {
        let accountId = get.modal(state).state;
        let account = get.accountById(state, accountId);
        let label = account ? displayLabel(account) : null;
        return {
            accountId,
            label
        };
    },

    dispatch => {
        return {
            deleteAccount(accountId) {
                actions.deleteAccount(dispatch, accountId);
            }
        };
    },

    ({ label, accountId }, { deleteAccount }) => {
        return {
            label,
            handleDelete() {
                deleteAccount(accountId);
            }
        };
    }
)(props => {
    return (
        <ModalContent
            title={$t('client.confirmdeletemodal.title')}
            body={$t('client.settings.erase_account', { label: props.label })}
            footer={<CancelAndDelete onDelete={props.handleDelete} />}
        />
    );
});

registerModal(DELETE_ACCOUNT_MODAL_SLUG, () => <ConfirmDeleteModal />);
