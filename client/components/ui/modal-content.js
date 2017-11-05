import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { actions } from '../../store';

const ModalContent = connect(null, dispatch => {
    return {
        handleClose() {
            actions.hideModal(dispatch);
        }
    };
})(props => {
    return (
        <React.Fragment>
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
        </React.Fragment>
    );
});

ModalContent.propTypes = {
    title: PropTypes.string.isRequired,
    body: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    footer: PropTypes.element
};

export default ModalContent;
