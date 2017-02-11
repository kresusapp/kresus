import React from 'react';

class Modal extends React.Component {

    componentDidMount() {
        let modalElement = $(`#${this.props.modalId}`);

        if (this.props.onOpen) {
            modalElement.on('show.bs.modal', this.props.onOpen);
        }

        if (this.props.onAfterOpen) {
            modalElement.on('shown.bs.modal', this.props.onAfterOpen);
        }

        if (this.props.onClose) {
            modalElement.on('hide.bs.modal', this.props.onClose);
        }

        if (this.props.onAfterClose) {
            modalElement.on('hidden.bs.modal', this.props.onAfterClose);
        }
    }

    componentWillUnmount() {
        let modalElement = $(`#${this.props.modalId}`);
        if (this.props.onOpen) {
            modalElement.off('show.bs.modal');
        }

        if (this.props.onAfterOpen) {
            modalElement.off('shown.bs.modal');
        }

        if (this.props.onClose) {
            modalElement.off('hide.bs.modal');
        }

        if (this.props.onAfterClose) {
            modalElement.off('hidden.bs.modal');
        }
    }

    render() {
        return (
            <div
              className="modal fade"
              id={ this.props.modalId }
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
                                { this.props.modalTitle }
                            </h4>
                        </div>
                        <div className="modal-body">
                            { this.props.modalBody }
                        </div>
                        <div className="modal-footer">
                            { this.props.modalFooter }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    // CSS id of the modal.
    modalId: React.PropTypes.string.isRequired,

    // Title displayed in the modal status bar.
    modalTitle: React.PropTypes.string.isRequired,

    // React component displayed as the main content of the modal.
    modalBody: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.element
    ]).isRequired,

    // React component displayed at the bottom of the modal.
    modalFooter: React.PropTypes.element.isRequired,

    // A callback called on opening before the modal is visible
    onOpen: React.PropTypes.func,

    // A callback called once the modal is opened and visible
    onAfterOpen: React.PropTypes.func,

    // A callback called on closing before the popup is closed
    onClose: React.PropTypes.func,

    // A callback called once the modal is closed and not visible anymore
    onAfterClose: React.PropTypes.func,
};

export default Modal;
