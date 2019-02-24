import React from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { assert } from '../../../helpers';

import ModalContent from './content';

const modalsMap = new Map();

export function registerModal(slug, modalMaker) {
    assert(!modalsMap.has(slug), `Modal for slug ${slug} already registered`);
    assert(typeof modalMaker === 'function', 'modalMaker shall be a function');
    modalsMap.set(slug, modalMaker);
}

function modalFactory(slug) {
    if (slug === null) {
        return null;
    }

    if (modalsMap.has(slug)) {
        let modalMaker = modalsMap.get(slug);
        return modalMaker();
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
        let { slug } = get.modal(state);
        return {
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
            isOpen={props.slug !== null}
            shouldCloseOnOverlayClick={true}
            onRequestClose={props.handleClose}
            appElement={document.getElementById('app')}>
            {modalFactory(props.slug)}
        </Modal>
    );
});

export default ModaleComponent;
