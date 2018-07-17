import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/modal';
import ModalContent from '../../ui/modal/content';
import CancelAndDelete from '../../ui/modal/cancel-and-delete-buttons';

export const DELETE_ACCESS_MODAL_SLUG = 'confirm-delete-access';

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
            deleteAccess(accessId) {
                actions.deleteAccess(dispatch, accessId);
            }
        };
    },

    ({ name, accessId }, { deleteAccess }) => {
        return {
            name,
            handleDelete() {
                deleteAccess(accessId);
            }
        };
    }
)(props => {
    return (
        <ModalContent
            title={$t('client.confirmdeletemodal.title')}
            body={$t('client.settings.erase_access', { name: props.name })}
            footer={<CancelAndDelete onDelete={props.handleDelete} />}
        />
    );
});

registerModal(DELETE_ACCESS_MODAL_SLUG, () => <ConfirmDeleteModal />);
