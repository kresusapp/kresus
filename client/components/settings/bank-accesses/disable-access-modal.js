import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import { registerModal } from '../../ui/modal';
import CancelAndWarn from '../../ui/modal/cancel-and-warn-buttons';
import ModalContent from '../../ui/modal/content';

const DisableAccessModal = connect(
    state => {
        return {
            accessId: get.modal(state).state
        };
    },

    dispatch => {
        return {
            async disableAccess(accessId) {
                try {
                    await actions.disableAccess(dispatch, accessId);
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO properly report.
                }
            }
        };
    },

    ({ accessId }, { disableAccess }) => {
        return {
            async handleConfirm() {
                await disableAccess(accessId);
            }
        };
    }
)(props => {
    const footer = (
        <CancelAndWarn
            onConfirm={props.handleConfirm}
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

export const DISABLE_MODAL_SLUG = 'disable-access';

registerModal(DISABLE_MODAL_SLUG, () => <DisableAccessModal />);
