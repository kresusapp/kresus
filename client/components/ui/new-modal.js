import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

import { makeDuplicatesDetails } from '../duplicates/default-params-modal';
import { disableAccessModal } from '../settings/bank-accesses/disable-access-modal';
import { syncAccountBalance } from '../settings/bank-accesses/sync-account-balance-modal';

const style = {
    content: {
        zIndex: 2000,
        maxWidth: '580px',
        align: 'center',
        margin: 'auto',
        maxHeight: '500px'
    },
    overlay: {
        opacity: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    }
};

function modalFactory(slug) {
    switch (slug) {
        case 'duplicates-default':
            return makeDuplicatesDetails();
        case 'disable-access':
            return disableAccessModal();
        case 'sync-account-balance':
            return syncAccountBalance();
        case null:
            return {
                title: 'This is the empty default modal',
                body: null,
                footer: null
            };
        default:
            return {
                title: `Error: modal with slug ${slug} does not have a valid factory.`,
                body: null,
                footer: null
            };
    }
}

const ModaleComponent = connect(
    state => {
        let { isOpen, slug } = get.modal(state);
        let { body, footer, title } = modalFactory(slug);
        return {
            isOpen,
            body,
            footer,
            title
        };
    },
    dispatch => {
        return {
            handleClose() {
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    return (
        <Modal
            isOpen={props.isOpen}
            shouldCloseOnOverlayClick={true}
            onRequestClose={props.handleClose}
            style={style}>
            <div className="modal-header">
                <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={props.handleClose}>
                    <span aria-hidden="true">&times;</span>
                </button>
                <h4 className="modal-title" id="myModalLabel">
                    {props.title}
                </h4>
            </div>
            <div className="modal-body">{props.body}</div>
            <div className="modal-footer">{props.footer}</div>
        </Modal>
    );
});

export default ModaleComponent;
