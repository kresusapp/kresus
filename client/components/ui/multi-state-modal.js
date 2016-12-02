import React from 'react';

import { assert } from '../../helpers';

import Modal from './modal';

class MultiStateModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: props.initialView
        };

        this.views = new Map;
        for (let name of Object.keys(props.views)) {
            assert(!this.views.has(name), 'duplicate view in MultiStateModal');
            this.views.set(name, props.views[name]);
        }

        assert(this.views.has(this.state.view), 'initial view must be known');

        this.switchView = this.switchView.bind(this);
    }

    switchView(view) {
        this.setState({
            view
        });
    }

    render() {
        assert(this.views.has(this.state.view));

        let modal = this.views.get(this.state.view)(this.switchView);
        let { modalTitle, modalBody, modalFooter } = modal;

        return (<Modal
          modalId={ this.props.modalId }
          modalBody={ modalBody }
          modalTitle={ modalTitle }
          modalFooter={ modalFooter }
        />);
    }
}

MultiStateModal.propTypes = {
    // The initial view to show to the user. Must be in the views descriptor below.
    initialView: React.PropTypes.string.isRequired,

    // An plain old object mapping viewName => { modalBody, modalTitle, modalFooter } factories.
    // Each factory will be passed the switchView function, to easily switch from one view to
    // the other.
    views: React.PropTypes.object.isRequired,

    // CSS unique id.
    modalId: React.PropTypes.string.isRequired,
};

export default MultiStateModal;
