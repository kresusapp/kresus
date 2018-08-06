import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';

import {
    translate as $t,
    NONE_CATEGORY_ID,
    UNKNOWN_OPERATION_TYPE,
    displayLabel
} from '../../../helpers';

import CategorySelect from '../../operations/category-select';
import OperationTypeSelect from '../../operations/type-select';

import { registerModal } from '../../ui/modal';
import ValidatedTextInput from '../../ui/validated-text-input';
import AmountInput from '../../ui/amount-input';
import ValidatedDatePicker from '../../ui/validated-date-picker';
import CancelAndSave from '../../ui/modal/cancel-and-save-buttons';
import ModalContent from '../../ui/modal/content';

export const ADD_OPERATION_MODAL_SLUG = 'add-operation';

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
            async createOperation(operation) {
                try {
                    await actions.createOperation(dispatch, operation);
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO properly report.
                }
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
                accountId: this.props.account.id
            };

            this.props.createOperation(operation);
        };

        submitIsEnabled = () => {
            return (
                this.state.date &&
                this.state.title &&
                this.state.title.trim().length &&
                this.state.amount &&
                !Number.isNaN(this.state.amount)
            );
        };

        render() {
            let accountTitle = displayLabel(this.props.account);
            let title = $t('client.addoperationmodal.add_operation', {
                account: accountTitle
            });

            let body = (
                <React.Fragment>
                    <p>
                        {$t('client.addoperationmodal.description', {
                            account: accountTitle
                        })}
                    </p>

                    <form>
                        <div className="cols-with-label">
                            <label htmlFor={`date${this.props.account.id}`}>
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

                        <div className="cols-with-label">
                            <label htmlFor={`type${this.props.account.id}`}>
                                {$t('client.addoperationmodal.type')}
                            </label>
                            <OperationTypeSelect
                                onChange={this.handleSelectOperationType}
                                value={this.state.type}
                                id={`type${this.props.account.id}`}
                            />
                        </div>

                        <div className="cols-with-label">
                            <label htmlFor={`label${this.props.account.id}`}>
                                {$t('client.addoperationmodal.label')}
                            </label>
                            <ValidatedTextInput
                                id={`label${this.props.account.id}`}
                                onChange={this.handleChangeLabel}
                                ref={this.refTitleInput}
                            />
                        </div>

                        <div className="cols-with-label">
                            <label htmlFor={`amount${this.props.account.id}`}>
                                {$t('client.addoperationmodal.amount')}
                            </label>
                            <AmountInput
                                id={`amount${this.props.account.id}`}
                                signId={`sign${this.props.account.id}`}
                                onChange={this.handleChangeAmount}
                                ref={this.refAmountInput}
                                checkValidity={true}
                                className="block"
                            />
                        </div>

                        <div className="cols-with-label">
                            <label htmlFor={`category${this.props.account.id}`}>
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
                <CancelAndSave
                    onSave={this.handleSubmit}
                    saveLabel={$t('client.addoperationmodal.submit')}
                    isSaveDisabled={!this.submitIsEnabled()}
                />
            );

            return <ModalContent title={title} body={body} footer={footer} />;
        }
    }
);

registerModal(ADD_OPERATION_MODAL_SLUG, () => <AddOperationModal />);
