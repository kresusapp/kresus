import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from '../../../store';

import { translate as $t, NONE_CATEGORY_ID, UNKNOWN_OPERATION_TYPE } from '../../../helpers';

import CategorySelect from '../../operations/category-select';
import OperationTypeSelect from '../../operations/type-select';

import Modal from '../../ui/modal';
import ValidatedTextInput from '../../ui/validated-text-input';
import AmountInput from '../../ui/amount-input';
import ValidatedDatePicker from '../../ui/validated-date-picker';

class AddOperationModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.makeClearState();

        this.handleOnSubmit = this.handleOnSubmit.bind(this);

        this.handleChangeDate = date => this.setState({ date });
        this.handleChangeLabel = title => this.setState({ title });
        this.handleChangeAmount = amount => this.setState({ amount });

        this.handleClearOperation = this.handleClearOperation.bind(this);

        this.handleSelectOperationType = type => this.setState({ type });
        this.handleSelectCategory = id => this.setState({ categoryId: id });

        this.dateInput = null;
        this.titleInput = null;
        this.amountInput = null;
    }

    handleOnSubmit(event) {
        event.preventDefault();

        let operation = {
            date: new Date(this.state.date),
            title: this.state.title,
            amount: this.state.amount,
            categoryId: this.state.categoryId,
            type: this.state.type,
            accountId: this.props.account.id
        };

        this.props.createOperation(operation);

        $(`#addOperation${this.props.account.id}`).modal('toggle');
        this.handleClearOperation();
    }

    makeClearState() {
        return {
            date: null,
            title: null,
            amount: null,
            categoryId: NONE_CATEGORY_ID,
            type: UNKNOWN_OPERATION_TYPE
        };
    }

    handleClearOperation() {
        if (this.dateInput) {
            this.dateInput.clear();
        }
        if (this.titleInput) {
            this.titleInput.clear();
        }
        if (this.amountInput) {
            this.amountInput.clear();
        }
        this.setState(this.makeClearState());
    }

    submitIsEnabled() {
        return (
            this.state.date &&
            this.state.title &&
            this.state.title.trim().length &&
            this.state.amount &&
            typeof this.state.amount === 'number'
        );
    }

    render() {
        let modalId = this.props.modalId;

        let refDateInput = input => {
            this.dateInput = input;
        };
        let refTitleInput = input => {
            this.titleInput = input;
        };
        let refAmountInput = input => {
            this.amountInput = input;
        };

        let modalBody = (
            <div>
                <span>
                    {$t('client.addoperationmodal.description', {
                        account: this.props.account.title
                    })}
                </span>

                <form
                    id={`formAddOperation${this.props.account.id}`}
                    onSubmit={this.handleOnSubmit}>
                    <div className="form-group">
                        <label className="control-label" htmlFor={`date${this.props.account.id}`}>
                            {$t('client.addoperationmodal.date')}
                        </label>
                        <ValidatedDatePicker
                            id={`date${this.props.account.id}`}
                            onSelect={this.handleChangeDate}
                            ref={refDateInput}
                            value={this.state.date}
                        />
                    </div>

                    <div className="form-group">
                        <label className="control-label" htmlFor={`type${this.props.account.id}`}>
                            {$t('client.addoperationmodal.type')}
                        </label>
                        <OperationTypeSelect
                            onChange={this.handleSelectOperationType}
                            selectedValue={this.state.type}
                            id={`type${this.props.account.id}`}
                        />
                    </div>

                    <div className="form-group">
                        <label className="control-label" htmlFor={`label${this.props.account.id}`}>
                            {$t('client.addoperationmodal.label')}
                        </label>
                        <ValidatedTextInput
                            id={`label${this.props.account.id}`}
                            onChange={this.handleChangeLabel}
                            ref={refTitleInput}
                        />
                    </div>

                    <div className="form-group">
                        <label className="control-label" htmlFor={`amount${this.props.account.id}`}>
                            {$t('client.addoperationmodal.amount')}
                        </label>
                        <AmountInput
                            id={`amount${this.props.account.id}`}
                            signId={`sign${this.props.account.id}`}
                            onChange={this.handleChangeAmount}
                            ref={refAmountInput}
                            showValidity={true}
                        />
                    </div>

                    <div className="form-group">
                        <label
                            className="control-label"
                            htmlFor={`category${this.props.account.id}`}>
                            {$t('client.addoperationmodal.category')}
                        </label>
                        <CategorySelect
                            id={`category${this.props.account.id}`}
                            onChange={this.handleSelectCategory}
                            selectedValue={this.state.categoryId}
                        />
                    </div>
                </form>
            </div>
        );

        let modalTitle = $t('client.addoperationmodal.add_operation', {
            account: this.props.account.title
        });

        let modalFooter = (
            <div>
                <input
                    type="button"
                    className="btn btn-default"
                    data-dismiss="modal"
                    value={$t('client.general.cancel')}
                />
                <input
                    type="submit"
                    form={`formAddOperation${this.props.account.id}`}
                    className="btn btn-success"
                    value={$t('client.addoperationmodal.submit')}
                    disabled={!this.submitIsEnabled()}
                />
            </div>
        );

        return (
            <Modal
                modalId={modalId}
                modalBody={modalBody}
                modalTitle={modalTitle}
                modalFooter={modalFooter}
                onBeforeOpen={this.handleClearOperation}
            />
        );
    }
}

AddOperationModal.propTypes = {
    // Unique identifier of the modal
    modalId: PropTypes.string.isRequired,

    // The account for which the operation has to be added. instanceof Account
    account: PropTypes.object.isRequired
};

const Export = connect(null, dispatch => {
    return {
        createOperation(operation) {
            actions.createOperation(dispatch, operation);
        }
    };
})(AddOperationModal);

export default Export;
