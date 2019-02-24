import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';
import { registerModal } from '../../ui/modal';

import AccountSelector from './account-select';
import AmountInput from '../../ui/amount-input';
import ModalContent from '../../ui/modal/content';
import CancelAndSubmit from '../../ui/modal/cancel-and-submit-buttons';

export const MODAL_SLUG = 'create-alert';

const AlertCreationModal = connect(
    state => {
        return {
            type: get.modal(state).state
        };
    },
    dispatch => {
        return {
            async createAlert(alert) {
                try {
                    await actions.createAlert(dispatch, alert);
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
            limit: null,
            accountId: null
        };

        refOrderSelect = node => (this.order = node);

        handleChangeAmountInput = limit => {
            this.setState({ limit });
        };

        handleChangeAccount = accountId => {
            this.setState({ accountId });
        };

        handleSubmit = () => {
            let newAlert = {
                type: this.props.type,
                limit: this.state.limit,
                accountId: this.state.accountId,
                order: this.order.value
            };
            this.props.createAlert(newAlert);
        };

        render() {
            const title = $t(`client.settings.emails.add_${this.props.type}`);
            const isBalanceAlert = this.props.type === 'balance';

            const body = (
                <form id={MODAL_SLUG} onSubmit={this.handleSubmit}>
                    <div className="cols-with-label">
                        <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                        <AccountSelector onChange={this.handleChangeAccount} id="account" />
                    </div>

                    <div className="cols-with-label">
                        <label htmlFor="order-select">
                            {$t(`client.settings.emails.send_if_${this.props.type}_is`)}&nbsp;
                        </label>

                        <div className="balance-inputs">
                            <select id="order-select" ref={this.refOrderSelect}>
                                <option value="gt">
                                    {$t('client.settings.emails.greater_than')}
                                </option>
                                <option value="lt">{$t('client.settings.emails.less_than')}</option>
                            </select>

                            <AmountInput
                                defaultValue={
                                    this.state.limit !== null ? Math.abs(this.state.limit) : null
                                }
                                initiallyNegative={isBalanceAlert && this.state.limit < 0}
                                togglable={isBalanceAlert}
                                onChange={this.handleChangeAmountInput}
                                signId="sign-alert"
                            />
                        </div>
                    </div>
                </form>
            );

            let isSubmitDisabled = Number.isNaN(Number.parseFloat(this.state.limit));

            const footer = (
                <CancelAndSubmit
                    isSubmitDisabled={isSubmitDisabled}
                    submitLabel={$t('client.settings.emails.create')}
                    formId={MODAL_SLUG}
                />
            );

            return <ModalContent title={title} body={body} footer={footer} />;
        }
    }
);

registerModal(MODAL_SLUG, () => <AlertCreationModal />);
