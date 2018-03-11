import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../../store';

import { translate as $t, NONE_CATEGORY_ID, UNKNOWN_OPERATION_TYPE } from '../../../helpers';

import CategorySelect from '../../operations/category-select';
import OperationTypeSelect from '../../operations/type-select';

import { registerModal } from '../../ui/new-modal';
import ValidatedTextInput from '../../ui/validated-text-input';
import AmountInput from '../../ui/amount-input';
import ValidatedDatePicker from '../../ui/validated-date-picker';
import SaveAndCancel from '../../ui/new-modal/save-and-cancel-buttons';
import ModalContent from '../../ui/new-modal/content';

const MODAL_SLUG = 'add-operation';

const AddOperationModal = connect(
    state => {
        let accountId = get.modal(state).state;
        let account = get.accountById(state, accountId);
        return {
            account
        };
    },
    dispatch => {
        return {
            createOperation(operation) {
                actions.createOperation(dispatch, operation);
            }
        };
    }
)(
    class Content extends React.Component {
        state = {
            date: null,
            title: null,
            amount: null,
            categoryId: NONE_CATEGORY_ID,
            type: UNKNOWN_OPERATION_TYPE
        };

        refDateInput = input => (this.dateInput = input);
        refTitleInput = input => (this.titleInput = input);
        refAmountInput = input => (this.amountInput = input);

        handleChangeDate = date => this.setState({ date });
        handleChangeLabel = title => this.setState({ title });
        handleChangeAmount = amount => this.setState({ amount });
        handleSelectOperationType = type => this.setState({ type });
        handleSelectCategory = id => this.setState({ categoryId: id });

        handleSubmit = event => {
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
        };

        submitIsEnabled = () => {
            return (
                this.state.date &&
                this.state.title &&
                this.state.title.trim().length &&
                this.state.amount &&
                typeof this.state.amount === 'number'
            );
        };

        render() {
            let title = $t('client.addoperationmodal.add_operation', {
                account: this.props.account.title
            });

            let body = (
                <React.Fragment>
                    <span>
                        {$t('client.addoperationmodal.description', {
                            account: this.props.account.title
                        })}
                    </span>

                    <form>
                        <div className="form-group">
                            <label
                                className="control-label"
                                htmlFor={`date${this.props.account.id}`}>
                                {$t('client.addoperationmodal.date')}
                            </label>
                            <ValidatedDatePicker
                                id={`date${this.props.account.id}`}
                                onSelect={this.handleChangeDate}
                                ref={this.refDateInput}
                                value={this.state.date}
                                className="block"
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="control-label"
                                htmlFor={`type${this.props.account.id}`}>
                                {$t('client.addoperationmodal.type')}
                            </label>
                            <OperationTypeSelect
                                onChange={this.handleSelectOperationType}
                                value={this.state.type}
                                id={`type${this.props.account.id}`}
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="control-label"
                                htmlFor={`label${this.props.account.id}`}>
                                {$t('client.addoperationmodal.label')}
                            </label>
                            <ValidatedTextInput
                                id={`label${this.props.account.id}`}
                                onChange={this.handleChangeLabel}
                                ref={this.refTitleInput}
                            />
                        </div>

                        <div className="form-group">
                            <label
                                className="control-label"
                                htmlFor={`amount${this.props.account.id}`}>
                                {$t('client.addoperationmodal.amount')}
                            </label>
                            <AmountInput
                                id={`amount${this.props.account.id}`}
                                signId={`sign${this.props.account.id}`}
                                onChange={this.handleChangeAmount}
                                ref={this.refAmountInput}
                                showValidity={true}
                                className="block"
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
                                value={this.state.categoryId}
                            />
                        </div>
                    </form>
                </React.Fragment>
            );

            let footer = (
                <SaveAndCancel
                    onClickSave={this.handleSubmit}
                    saveLabel={$t('client.addoperationmodal.submit')}
                    isSaveDisabled={!this.submitIsEnabled()}
                />
            );
            return <ModalContent title={title} body={body} footer={footer} />;
        }
    }
);

registerModal(MODAL_SLUG, () => <AddOperationModal />);

const AddOperationModalButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, MODAL_SLUG, props.accountId);
            }
        };
    }
)(props => {
    return (
        <button
            className="pull-right fa fa-plus-circle"
            aria-label="Add an operation"
            onClick={props.handleClick}
            title={$t('client.settings.add_operation')}
        />
    );
});

AddOperationModalButton.propTypes = {
    // The unique identifier to whom the operation has to ba added.
    accountId: PropTypes.string.isRequired
};

export default AddOperationModalButton;
