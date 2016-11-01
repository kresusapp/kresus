import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';

import { translate as $t,
         NONE_CATEGORY_ID,
         UNKNOWN_OPERATION_TYPE } from '../../../helpers';

import CategorySelect from '../../operations/category-select';
import OperationTypeSelect from '../../operations/type-select';

import Modal from '../../ui/modal';
import ValidableInputText from '../../ui/checked-text';
import ValidableInputNumber from '../../ui/checked-number';
import ValidableInputDate from '../../ui/checked-date';

class AddOperationModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.makeClearState();

        this.handleOnSubmit = this.handleOnSubmit.bind(this);

        this.returnDateValue = date => this.setState({ date });
        this.returnTitleValue = title => this.setState({ title });
        this.returnAmountValue = amount => this.setState({ amount });
        this.handleOnSelectOperationType = type => this.setState({ type });
        this.handleOnSelectCategory = id => this.setState({ categoryId: id });
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

    render() {
        let modalId = this.props.modalId;

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
                          types={ this.props.types }
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
                          categories={ this.props.categories }
                          getCategoryTitle={ this.props.getCategoryTitle }
                          getCategoryColor={ this.props.getCategoryColor }
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

AddOperationModal.propTypes = {
    // Unique identifier of the modal
    modalId: React.PropTypes.string.isRequired,

    // The account for which the operation has to be added. instanceof Account
    account: React.PropTypes.object.isRequired
};

let Export = connect(state => {
    return {
        categories: get.categories(state),
        types: get.types(state),
        getCategoryTitle: categoryId => get.categoryById(state, categoryId).title,
        getCategoryColor: categoryId => get.categoryById(state, categoryId).color,
    };
}, dispatch => {
    return {
        createOperation(operation) {
            actions.createOperation(dispatch, operation);
        }
    };
})(AddOperationModal);

export default Export;
