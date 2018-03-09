import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions, get } from '../../store';

import { registerModal } from '../ui/new-modal';
import CancelAndWarning from '../ui/modal-cancel-and-warning-button';

const MODAL_SLUG = 'confirm-duplicates';

const Body = () => {
    return $t($t('client.similarity.confirm'));
};

const Title = () => {
    return $t('client.similarity.confirm_title');
};

const Footer = connect(
    state => {
        let modalState = get.modal(state, MODAL_SLUG).state;
        return {
            toKeep: modalState.toKeep,
            toRemove: modalState.toRemove
        };
    },
    dispatch => {
        return {
            onClickWarning(toKeep, toRemove) {
                actions.mergeOperations(dispatch, toKeep, toRemove);
            }
        };
    },
    (stateToProps, dispatchToProps) => {
        return {
            ...stateToProps,
            onClickWarning() {
                dispatchToProps.onClickWarning(stateToProps.toKeep, stateToProps.toRemove);
            }
        };
    }
)(props => {
    return (
        <CancelAndWarning
            onClickWarning={props.onClickWarning}
            warningLabel={$t('client.similarity.merge')}
        />
    );
});

registerModal(MODAL_SLUG, () => {
    return {
        title: <Title />,
        body: <Body />,
        footer: <Footer />
    };
});

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
