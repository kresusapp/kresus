import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { actions } from '../../../store';

const ModalContent = connect(
    null,
    dispatch => {
        return {
            handleClose() {
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    return (
        <React.Fragment>
            <div className="modal-header">
                <h4 className="modal-title">{props.title}</h4>
                <button
                    type="button"
                    className="modal-close"
                    aria-label="Close"
                    onClick={props.handleClose}>
                    <span aria-label="close modal" className="fa fa-times" />
                </button>
            </div>
            <div className="modal-body">{props.body}</div>
            <div className="modal-footer">{props.footer}</div>
        </React.Fragment>
    );
});

ModalContent.propTypes = {
    // The title of the modal.
    title: PropTypes.string.isRequired,

    // The body of the modal.
    body: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),

    // The footer of the modal. Usually a set of control buttons.
    footer: PropTypes.element
};

export default ModalContent;
