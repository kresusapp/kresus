import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../../store';

import { translate as $t, NONE_CATEGORY_ID, UNKNOWN_OPERATION_TYPE } from '../../../helpers';

import CategorySelect from '../../operations/category-select';
import OperationTypeSelect from '../../operations/type-select';

import Modal from '../../ui/modal';
import ValidatedTextInput from '../../ui/validated-text-input';
import ValidatedAmountInput from '../../ui/validated-amount-input';
import ValidatedDateInput from '../../ui/validated-date-input';

class AddOperationModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.makeClearState();

        this.handleOnSubmit = this.handleOnSubmit.bind(this);

        this.handleChangeDate = date => this.setState({ date });
        this.handleChangeLabel = title => this.setState({ title });
        this.handleChangeAmount = amount => this.setState({ amount });

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
            bankAccount: this.props.account.accountNumber
        };

        this.props.createOperation(operation);

        $(`#addOperation${this.props.account.id}`).modal('toggle');
        this.clearOperation();
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

    clearOperation() {
        this.dateInput.clear();
        this.titleInput.clear();
        this.amountInput.clear();
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

        let labelDate = $t('client.addoperationmodal.date');
        let labelTitle = $t('client.addoperationmodal.label');
        let labelAmount = $t('client.addoperationmodal.amount');

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
                    onSubmit={this.handleOnSubmit}
                >
                    <ValidatedDateInput
                        onChange={this.handleChangeDate}
                        inputID={`date${this.props.account.id}`}
                        label={labelDate}
                        ref={refDateInput}
                    />

                    <div className="form-group">
                        <label className="control-label" htmlFor={`type${this.props.account.id}`}>
                            {$t('client.addoperationmodal.type')}
                        </label>
                        <OperationTypeSelect
                            operation={this.state}
                            types={this.props.types}
                            onSelectId={this.handleSelectOperationType}
                        />
                    </div>

                    <ValidatedTextInput
                        inputID={`title${this.props.account.id}`}
                        onChange={this.handleChangeLabel}
                        label={labelTitle}
                        ref={refTitleInput}
                    />

                    <ValidatedAmountInput
                        onChange={this.handleChangeAmount}
                        label={labelAmount}
                        inputID={`amount${this.props.account.id}`}
                        className="form-control"
                        ref={refAmountInput}
                    />

                    <div className="form-group">
                        <label
                            className="control-label"
                            htmlFor={`category${this.props.account.id}`}
                        >
                            {$t('client.addoperationmodal.category')}
                        </label>
                        <CategorySelect
                            operation={this.state}
                            onSelectId={this.handleSelectCategory}
                            categories={this.props.categories}
                            getCategory={this.props.getCategory}
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
                    value={$t('client.addoperationmodal.cancel')}
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

const Export = connect(
    state => {
        return {
            categories: get.categories(state),
            types: get.types(state),
            getCategory: categoryId => get.categoryById(state, categoryId)
        };
    },
    dispatch => {
        return {
            createOperation(operation) {
                actions.createOperation(dispatch, operation);
            }
        };
    }
)(AddOperationModal);

export default Export;
