import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get, actions } from '../../store';

import Modal from '../ui/modal';

import DeleteOperation from './delete-operation';
import SubOperations from './split-operation';
import DetailedOperation from './detailed-operation';

const MODAL_ID = 'details-modal';

class DetailsModal extends React.Component {
    render() {
        let op = this.props.operation;

        if (op === null) {
            return <div/>;
        }

        let modalTitle = $t('client.operations.details');

        let modalFooter = (
            <div>
                <DeleteOperation
                  operation={ op }
                  formatCurrency={ this.props.formatCurrency }
                  disabled={ op.parentOperationId !== '' }
                />
            </div>
        );

        let modalBody = (
            <div>
                <DetailedOperation
                  operation={ this.props.operation }
                  categories={ this.props.categories }
                  getCategoryTitle={ this.props.getCategoryTitle }
                  formatCurrency={ this.props.formatCurrency }
                  types={ this.props.types }
                  makeHandleSelectCategory={ this.props.makeHandleSelectCategory }
                  makeHandleSelectType={ this.props.makeHandleSelectType }
                />
                <SubOperations
                  operationId={ this.props.operationId }
                  categories={ this.props.categories }
                  getCategoryTitle={ this.props.getCategoryTitle }
                  formatCurrency={ this.props.formatCurrency }
                  types={ this.props.types }
                  makeHandleSelectCategory={ this.props.makeHandleSelectCategory }
                  makeHandleSelectType={ this.props.makeHandleSelectType }
                />
            </div>
        );

        return (
            <Modal
              modalId={ MODAL_ID }
              modalBody={ modalBody }
              modalTitle={ modalTitle }
              modalFooter={ modalFooter }
            />
        );
    }
}

let ConnectedModal = connect((state, props) => {
    let operation = props.operationId ? get.operationById(state, props.operationId) : null;
    return {
        operation
    };
}, dispatch => {
    return {
        makeHandleSelectType: operation => type => {
            actions.setOperationType(dispatch, operation, type);
        },
        makeHandleSelectCategory: operation => category => {
            actions.setOperationCategory(dispatch, operation, category);
        }
    };
})(DetailsModal);

ConnectedModal.propTypes = {
    // An operation id (can be null) from which we may retrieve a full
    // operation.
    operationId: React.PropTypes.string,

    // Function called to format amounts.
    formatCurrency: React.PropTypes.func.isRequired,

    // Array of categories (used for the category select).
    categories: React.PropTypes.array.isRequired,

    // Array of types (used for the type select).
    types: React.PropTypes.array.isRequired,

    // Maps categories => titles (used for the category select).
    getCategoryTitle: React.PropTypes.func.isRequired,
};

// Simple wrapper that exposes one setter (setOperationId), to not expose a
// ref'd redux component to the above component.
class Wrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOperationId: null
        };

        // Togglable state to only show right thereafter the user asked.
        this.show = false;
    }

    setOperationId(operationId) {
        this.show = true;
        this.setState({
            selectedOperationId: operationId
        });
    }

    componentDidUpdate() {
        if (this.show && this.state.selectedOperationId !== null) {
            $(`#${MODAL_ID}`).modal('show');
            this.show = false;
        }
    }

    render() {
        return (
            <ConnectedModal
              operationId={ this.state.selectedOperationId }
              formatCurrency={ this.props.formatCurrency }
              categories={ this.props.categories }
              types={ this.props.types }
              getCategoryTitle={ this.props.getCategoryTitle }
            />
        );
    }
}

export default Wrapper;
