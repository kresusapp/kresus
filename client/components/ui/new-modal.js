import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { assert } from '../../helpers';

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

// The map
let modalsMap = new Map();

export function registerModal(slug, makeModal) {
    assert(!modalsMap.has(slug), `Modal for slug ${slug} already registered`);
    modalsMap.set(slug, makeModal);
}

function modalFactory(slug) {
    if (slug === null) {
        return function() {
            return {
                title: 'This is the empty default modal',
                body: null,
                footer: null
            };
        };
    }

    if (modalsMap.has(slug)) {
        return modalsMap.get(slug);
    }

    return function() {
        return {
            title: `Error: modal with slug ${slug} does not have a valid factory.`,
            body: null,
            footer: null
        };
    };
}

const ModaleComponent = connect(
    state => {
        let { isOpen, slug } = get.modal(state);
        let { body, footer, title } = modalFactory(slug)();
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
            style={style}
            appElement={document.getElementById('app')}>
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
