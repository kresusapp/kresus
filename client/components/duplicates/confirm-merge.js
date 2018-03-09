import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions, get } from '../../store';

import { registerModal } from '../ui/new-modal';
import CancelAndWarning from '../ui/new-modal/cancel-and-warning-buttons';
import ModalContent from '../ui/new-modal/content';

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
    let title = $t('client.similarity.confirm_title');
    let body = $t('client.similarity.confirm');
    let footer = (
        <CancelAndWarning
            onClickWarning={props.onClickWarning}
            warningLabel={$t('client.similarity.merge')}
        />
    );
    return <ModalContent title={title} body={body} footer={footer} />;
});

registerModal(MODAL_SLUG, () => <ConfirmMergeModal />);

const ConfirmMergeButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleOpenModal() {
                let { toKeep, toRemove } = props;
                actions.showModal(dispatch, MODAL_SLUG, { toKeep, toRemove });
            }
        };
    }
)(props => {
    return (
        <button className="btn btn-primary" onClick={props.handleOpenModal}>
            <span className="fa fa-compress" aria-hidden="true" />
            <span className="merge-title">{$t('client.similarity.merge')}</span>
        </button>
    );
});

ConfirmMergeButton.propTypes = {
    // The operation object to keep.
    toKeep: PropTypes.object.isRequired,

    // The operation object to be removed.
    toRemove: PropTypes.object.isRequired
};

export default ConfirmMergeButton;
