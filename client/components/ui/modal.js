import React from 'react';
import PropTypes from 'prop-types';

class Modal extends React.Component {
    componentDidMount() {
        let modalElement = $(`#${this.props.modalId}`);

        if (this.props.onBeforeOpen) {
            modalElement.on('show.bs.modal', this.props.onBeforeOpen);
        }

        if (this.props.onAfterOpen) {
            modalElement.on('shown.bs.modal', this.props.onAfterOpen);
        }

        if (this.props.onAfterHide) {
            modalElement.on('hidden.bs.modal', this.props.onAfterHide);
        }
    }

    componentWillUnmount() {
        let modalElement = $(`#${this.props.modalId}`);
        if (this.props.onBeforeOpen) {
            modalElement.off('show.bs.modal');
        }

        if (this.props.onAfterOpen) {
            modalElement.off('shown.bs.modal');
        }

        if (this.props.onAfterHide) {
            modalElement.off('hidden.bs.modal');
        }
    }

    render() {
        return (
            <div
                className="modal fade"
                id={this.props.modalId}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="myModalLabel"
                aria-hidden="true">
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
                            <h4 className="modal-title" id="myModalLabel">
                                {this.props.modalTitle}
                            </h4>
                        </div>
                        <div className="modal-body">{this.props.modalBody}</div>
                        <div className="modal-footer">{this.props.modalFooter}</div>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    // CSS id of the modal.
    modalId: PropTypes.string.isRequired,

    // Title displayed in the modal status bar.
    modalTitle: PropTypes.string.isRequired,

    // React component displayed as the main content of the modal.
    modalBody: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,

    // React component displayed at the bottom of the modal.
    modalFooter: PropTypes.element.isRequired,

    // A callback called on opening before the modal is visible.
    onBeforeOpen: PropTypes.func,

    // A callback called once the modal is opened and visible.
    onAfterOpen: PropTypes.func,

    // A callback called once the modal is hidden.
    onAfterHide: PropTypes.func
};

export default Modal;
