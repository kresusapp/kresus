import React from 'react';

const Modal = props => {
    return (
        <div
          className="modal fade"
          id={ props.modalId }
          tabIndex="-1"
          role="dialog"
          aria-labelledby="myModalLabel"
          aria-hidden="true" >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4
                          className="modal-title"
                          id="myModalLabel">
                            { props.modalTitle }
                        </h4>
                    </div>
                    <div className="modal-body">
                        { props.modalBody }
                    </div>
                    <div className="modal-footer">
                        { props.modalFooter }
                    </div>
                </div>
            </div>
        </div>
    );
};

Modal.propTypes = {
    // CSS id of the modal.
    modalId: React.PropTypes.string.isRequired,

    // Title displayed in the modal status bar.
    modalTitle: React.PropTypes.string.isRequired,

    // React component displayed as the main content of the modal.
    // TODO can also be a string
    // modalBody: React.PropTypes.element.isRequired,

    // React component displayed at the bottom of the modal.
    modalFooter: React.PropTypes.element.isRequired
};

export default Modal;
