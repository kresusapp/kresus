import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { assert } from '../../helpers';

import ModalContent from './modal-content';

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
        return <ModalContent title="This is the empty default modal" body={null} footer={null} />;
    }

    if (modalsMap.has(slug)) {
        return modalsMap.get(slug);
    }

    return (
        <ModalContent
            title={`Error: modal with slug ${slug} does not have a valid factory.`}
            body={null}
            footer={null}
        />
    );
}

const ModaleComponent = connect(
    state => {
        let { isOpen, slug } = get.modal(state);
        return {
            isOpen,
            slug
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
            {modalFactory(props.slug)}
        </Modal>
    );
});

export default ModaleComponent;
