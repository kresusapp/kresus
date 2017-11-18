import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/new-modal';

const MODAL_SLUG = 'confirm-delete-access';

const Body = connect(state => {
    let accessId = get.modal(state).state;
    let { title } = accessId ? get.accessById(state, accessId) : null;
    return {
        title
    };
})(props => {
    return <span>{$t('client.settings.erase_access', { title: props.title })}</span>;
});

const Footer = connect(
    state => {
        return {
            accessId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ accessId }, { dispatch }) => {
        return {
            handleCancel() {
                actions.hideModal(dispatch);
            },
            handleDelete() {
                actions.deleteAccess(dispatch, accessId);
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
