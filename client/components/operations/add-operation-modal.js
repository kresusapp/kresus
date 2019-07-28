import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import {
    translate as $t,
    NONE_CATEGORY_ID,
    UNKNOWN_OPERATION_TYPE,
    displayLabel,
    notify
} from '../../helpers';

import CategorySelect from './category-select';
import TypeSelect from './type-select';

import { registerModal } from '../ui/modal';
import CancelAndSubmit from '../ui/modal/cancel-and-submit-buttons';
import ModalContent from '../ui/modal/content';

import AmountInput from '../ui/amount-input';
import DisplayIf from '../ui/display-if';
import ValidatedDatePicker from '../ui/validated-date-picker';
import ValidatedTextInput from '../ui/validated-text-input';

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
                    notify.error(err.message);
                }
            }
        };
    }
)(
    class Content extends React.Component {
        state = {
            date: null,
            label: null,
            amount: null,
            categoryId: NONE_CATEGORY_ID,
            type: UNKNOWN_OPERATION_TYPE
        };

        handleChangeDate = date => this.setState({ date });
        handleChangeLabel = label => this.setState({ label });
        handleChangeAmount = amount => this.setState({ amount });
        handleSelectOperationType = type => this.setState({ type });
        handleSelectCategory = id => this.setState({ categoryId: id });

        handleSubmit = event => {
            event.preventDefault();

            let operation = {
                date: new Date(this.state.date),
                label: this.state.label,
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
                this.state.label &&
                this.state.label.trim().length &&
                this.state.amount &&
                !Number.isNaN(this.state.amount)
            );
        };

        render() {
            let accountLabel = displayLabel(this.props.account);
            let title = $t('client.addoperationmodal.add_operation', {
                account: accountLabel
            });

            let body = (
                <React.Fragment>
                    <p>
                        {$t('client.addoperationmodal.description', {
                            account: accountLabel
                        })}
                    </p>

                    <DisplayIf condition={this.props.account.vendorId !== 'manual'}>
                        <p className="alerts warning">{$t('client.addoperationmodal.warning')}</p>
                    </DisplayIf>

                    <form id={ADD_OPERATION_MODAL_SLUG} onSubmit={this.handleSubmit}>
                        <div className="cols-with-label">
                            <label htmlFor={`date${this.props.account.id}`}>
                                {$t('client.addoperationmodal.date')}
                            </label>
                            <ValidatedDatePicker
                                id={`date${this.props.account.id}`}
                                onSelect={this.handleChangeDate}
                                value={this.state.date}
                                className="block"
                            />
                        </div>

                        <div className="cols-with-label">
                            <label htmlFor={`type${this.props.account.id}`}>
                                {$t('client.addoperationmodal.type')}
                            </label>
                            <TypeSelect
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
                <CancelAndSubmit
                    submitLabel={$t('client.addoperationmodal.submit')}
                    isSubmitDisabled={!this.submitIsEnabled()}
                    formId={ADD_OPERATION_MODAL_SLUG}
                />
            );

            return <ModalContent title={title} body={body} footer={footer} />;
        }
    }
);

registerModal(ADD_OPERATION_MODAL_SLUG, () => <AddOperationModal />);
