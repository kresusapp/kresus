import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, AlertTypes } from '../../../helpers';
import { get, actions } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import AccountSelector from './account-select';
import AmountInput from '../../ui/amount-input';
import ModalContent from '../../ui/modal-content';
import SaveAndCancel from '../../ui/modal-save-and-cancel-button';

const MODAL_SLUG = 'create-alert';

const AlertCreationModal = connect(
    state => {
        return {
            type: get.modal(state).state
        };
    },
    dispatch => {
        return {
            createAlert(alert) {
                actions.createAlert(dispatch, alert);
            }
        };
    }
)(
    class Content extends React.Component {
        state = { limit: null };

        refOrderSelect = node => (this.order = node);
        refAccountSelector = node => (this.account = node);

        handleOnChangeAmountInput = limit => {
            this.setState({ limit });
        };
        handleSubmit = () => {
            let newAlert = {
                type: this.props.type,
                limit: this.state.limit,
                accountId: this.account.getWrappedInstance().value(),
                order: this.order.value
            };
            this.props.createAlert(newAlert);
        };

        render() {
            const title = $t(`client.settings.emails.add_${this.props.type}`);

            const isBalanceAlert = this.props.type === 'balance';

            const body = (
                <React.Fragment>
                    <div className="form-group">
                        <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                        <AccountSelector ref={this.refAccountSelector} id="account" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="order-select">
                            {$t(`client.settings.emails.send_if_${this.props.type}_is`)}&nbsp;
                        </label>

                        <select
                            className="form-control"
                            id="order-select"
                            ref={this.refOrderSelect}>
                            <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                            <option value="lt">{$t('client.settings.emails.less_than')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <AmountInput
                            defaultValue={
                                this.state.limit !== null ? Math.abs(this.state.limit) : null
                            }
                            initiallyNegative={isBalanceAlert && this.state.limit < 0}
                            togglable={isBalanceAlert}
                            onChange={this.handleOnChangeAmountInput}
                            signId="sign-alerd"
                        />
                    </div>
                </React.Fragment>
            );

            const footer = (
                <SaveAndCancel
                    onClickSave={this.handleSubmit}
                    isSaveDisabled={Number.isNaN(Number.parseFloat(this.state.limit))}
                    saveLabel={$t('client.settings.emails.create')}
                />
            );
            return <ModalContent title={title} body={body} footer={footer} />;
        }
    }
);
registerModal(MODAL_SLUG, <AlertCreationModal />);

const ShowAlertCreationModal = connect(null, (dispatch, props) => {
    return {
        onClick() {
            actions.showModal(dispatch, MODAL_SLUG, props.type);
        }
    };
})(props => {
    return (
        <button className="fa fa-plus-circle" aria-label="create alert" onClick={props.onClick} />
    );
});

ShowAlertCreationModal.propTypes = {
    // The type of alert to create.
    type: PropTypes.oneOf(AlertTypes).isRequired
};

export default ShowAlertCreationModal;
