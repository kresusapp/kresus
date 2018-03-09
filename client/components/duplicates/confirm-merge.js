import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions, get } from '../../store';

import { registerModal } from '../ui/new-modal';
import CancelAndWarning from '../ui/modal-cancel-and-warning-button';
import ModalContent from '../ui/modal-content';

const MODAL_SLUG = 'confirm-duplicates';

const ConfirmMergeModal = connect(
    state => {
        let { toKeep, toRemove } = get.modal(state, MODAL_SLUG).state;
        return { toKeep, toRemove };
    },
    dispatch => {
        return {
            onClickWarning(toKeep, toRemove) {
                actions.mergeOperations(dispatch, toKeep, toRemove);
            }
        };
    },
    ({ toKeep, toRemove }, { onClickWarning }) => {
        return {
            onClickWarning() {
                onClickWarning(toKeep, toRemove);
            }
        };
    }
)(props => {
    let Title = $t('client.similarity.confirm_title');
    let Body = $t('client.similarity.confirm');
    let Footer = (
        <CancelAndWarning
            onClickWarning={props.onClickWarning}
            warningLabel={$t('client.similarity.merge')}
        />
    );
    return <ModalContent title={Title} body={Body} footer={Footer} />;
});

registerModal(MODAL_SLUG, <ConfirmMergeModal />);

const ConfirmMergeButton = connect(null, (dispatch, props) => {
    return {
        handleOpenModal() {
            let { toKeep, toRemove } = props;
            actions.showModal(dispatch, MODAL_SLUG, { toKeep, toRemove });
        }
    };
})(props => {
    return (
        <button className="btn btn-primary" onClick={props.handleOpenModal}>
            <span className="fa fa-compress" aria-hidden="true" />
            <span className="merge-title">{$t('client.similarity.merge')}</span>
        </button>
    );
});

export default ConfirmMergeButton;
