import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/new-modal';

const MODAL_SLUG = 'confirm-delete-account';

const Body = connect(state => {
    let accountId = get.modal(state).state;
    let { title } = accountId ? get.accountById(state, accountId) : null;
    return {
        title
    };
})(props => {
    return <span>{$t('client.settings.erase_account', { title: props.title })}</span>;
});

const Footer = connect(
    state => {
        return {
            accountId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ accountId }, { dispatch }) => {
        return {
            handleCancel() {
                actions.hideModal(dispatch);
            },
            handleDelete() {
                actions.deleteAccount(dispatch, accountId);
            }
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button type="button" className="btn btn-danger" onClick={props.handleDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </div>
    );
});

registerModal(MODAL_SLUG, () => {
    return {
        title: $t('client.confirmdeletemodal.title'),
        body: <Body />,
        footer: <Footer />
    };
});

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
