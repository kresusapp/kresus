import React from 'react';
import PropTypes from 'prop-types';

import { assertHas } from '../../helpers';

import Modal from './modal';

class MultiStateModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: props.initialView
        };

        this.switchView = this.switchView.bind(this);
    }

    switchView(view) {
        this.setState({
            view
        });
    }

    render() {
        assertHas(this.props.views, this.state.view, 'initial view must be known');

        let modal = this.props.views[this.state.view](this.switchView);
        let { modalTitle, modalBody, modalFooter } = modal;

        return (
            <Modal
                modalId={this.props.modalId}
                modalBody={modalBody}
                modalTitle={modalTitle}
                modalFooter={modalFooter}
            />
        );
    }
}

MultiStateModal.propTypes = {
    // The initial view to show to the user. Must be in the views descriptor below.
    initialView: PropTypes.string.isRequired,

    // An plain old object mapping viewName => { modalBody, modalTitle, modalFooter } factories.
    // Each factory will be passed the switchView function, to easily switch from one view to
    // the other.
    views: PropTypes.object.isRequired,

    // CSS unique id.
    modalId: PropTypes.string.isRequired
};

export default MultiStateModal;
