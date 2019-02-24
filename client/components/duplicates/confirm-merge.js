import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions, get } from '../../store';

import { registerModal } from '../ui/modal';
import CancelAndWarn from '../ui/modal/cancel-and-warn-buttons';
import ModalContent from '../ui/modal/content';

export const MODAL_SLUG = 'confirm-duplicates';

const ConfirmMergeModal = connect(
    state => {
        let { toKeep, toRemove } = get.modal(state, MODAL_SLUG).state;
        return { toKeep, toRemove };
    },

    dispatch => {
        return {
            async mergeOperations(toKeep, toRemove) {
                try {
                    await actions.mergeOperations(dispatch, toKeep, toRemove);
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO report properly
                }
            }
        };
    },

    ({ toKeep, toRemove }, { mergeOperations }) => {
        return {
            handleConfirm() {
                mergeOperations(toKeep, toRemove);
            }
        };
    }
)(props => {
    let title = $t('client.similarity.confirm_title');
    let body = $t('client.similarity.confirm');
    let footer = (
        <CancelAndWarn
            onConfirm={props.handleConfirm}
            warningLabel={$t('client.similarity.merge')}
        />
    );
    return <ModalContent title={title} body={body} footer={footer} />;
});

registerModal(MODAL_SLUG, () => <ConfirmMergeModal />);
