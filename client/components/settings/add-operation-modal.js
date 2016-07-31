import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { has, translate as $t, NONE_CATEGORY_ID } from '../../helpers';

import CategorySelect from '../operations/category-select';
import OperationTypeSelect from '../operations/operation-type-select';

import Modal from '../ui/modal';
import ValidableInputText from '../ui/checked-text';
import ValidableInputNumber from '../ui/checked-number';
import ValidableInputDate from '../ui/checked-date';

class AddOperationModal extends React.Component {
    constructor(props) {
        has(props, 'account');
        super(props);

        this.state = this.makeClearState();

        this.handleOnSubmit = this.handleOnSubmit.bind(this);

        this.returnDateValue = this.returnDateValue.bind(this);
        this.returnTitleValue = this.returnTitleValue.bind(this);
        this.returnAmountValue = this.returnAmountValue.bind(this);
        this.handleOnSelectOperationType = this.handleOnSelectOperationType.bind(this);
        this.handleOnSelectCategory = this.handleOnSelectCategory.bind(this);
    }

    handleOnSubmit(event) {
        event.preventDefault();

        let operation = {
            date: new Date(this.state.date),
            title: this.state.title,
            amount: this.state.amount,
            categoryId: this.state.categoryId,
            operationTypeID: this.state.operationTypeID,
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
            operationTypeID: this.props.unknownOperationTypeId
        };
    }

    clearOperation() {
        this.setState(this.makeClearState());
        this.refs.date.clear();
        this.refs.title.clear();
        this.refs.amount.clear();
    }

    submitIsEnabled() {
        return this.state.date &&
               this.state.title && this.state.title.trim().length &&
               this.state.amount && typeof this.state.amount === 'number';
    }

    returnDateValue(date) { this.setState({ date }); }

    returnTitleValue(title) { this.setState({ title }); }

    returnAmountValue(amount) { this.setState({ amount }); }

    handleOnSelectOperationType(id) { this.setState({ operationTypeID: id }); }

    handleOnSelectCategory(id) { this.setState({ categoryId: id}); }

    render() {
        let modalId = `addOperation${this.props.account.id}`;

        let labelDate = $t('client.addoperationmodal.date');
        let labelTitle = $t('client.addoperationmodal.label');
        let labelAmount = $t('client.addoperationmodal.amount');

        let modalBody = (
            <div>
                <span>
                    { $t('client.addoperationmodal.description',
                      { account: this.props.account.title }) }
                </span>

                <form id={ `formAddOperation${this.props.account.id}` }
                  onSubmit={ this.handleOnSubmit }>

                    <ValidableInputDate
                      returnInputValue={ this.returnDateValue }
                      inputID={ `date${this.props.account.id}` }
                      label={ labelDate }
                      ref="date"
                    />

                    <div className="form-group">
                        <label className="control-label" htmlFor={ `type${this.props.account.id}` }>
                            { $t('client.addoperationmodal.type') }
                        </label>
                        <OperationTypeSelect
                          operation={ this.state }
                          onSelectId={ this.handleOnSelectOperationType }
                        />
                    </div>

                    <ValidableInputText
                      inputID={ `title${this.props.account.id}` }
                      returnInputValue={ this.returnTitleValue }
                      label={ labelTitle }
                      ref="title"
                    />

                    <ValidableInputNumber
                      inputID={ `amount${this.props.account.id}` }
                      returnInputValue={ this.returnAmountValue }
                      step="0.01"
                      label={ labelAmount }
                      ref="amount"
                    />

                    <div className="form-group">
                        <label className="control-label"
                          htmlFor={ `category${this.props.account.id}` }>
                            { $t('client.addoperationmodal.category') }
                        </label>
                        <CategorySelect
                          operation={ this.state }
                          onSelectId={ this.handleOnSelectCategory }
                        />
                    </div>
                </form>
            </div>
        );

        let modalTitle = $t('client.addoperationmodal.add_operation',
                            { account: this.props.account.title });

        let modalFooter = (
            <div>
                <input type="button" className="btn btn-default" data-dismiss="modal"
                  value={ $t('client.addoperationmodal.cancel') }
                />
                <input type="submit" form={ `formAddOperation${this.props.account.id}` }
                  className="btn btn-warning" value={ $t('client.addoperationmodal.submit') }
                  disabled={ !this.submitIsEnabled() }
                />
            </div>
        );

        return (
            <Modal
              modalId = { modalId }
              modalBody = { modalBody }
              modalTitle = { modalTitle }
              modalFooter = { modalFooter }
            />
        );
    }
}

let Export = connect(state => {
    return {
        unknownOperationTypeId: get.unknownOperationType(state).id
    };
}, dispatch => {
    return {
        createOperation(operation) { actions.createOperation(dispatch, operation); }
    };
})(AddOperationModal);

export default Export;
