import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, AlertTypes } from '../../../helpers';
import { get, actions } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import AccountSelector from './account-select';
import AmountInput from '../../ui/amount-input';
import ModalContent from '../../ui/modal-content';

const MODAL_SLUG = 'create-alert';

const AlertCreationModal = connect(
    state => {
        return {
            type: get.modal(state).state.type
        };
    },
    dispatch => {
        return {
            createAlert(alert) {
                actions.createAlert(dispatch, alert);
            },
            handleCancel() {
                actions.hideModal(dispatch);
            }
        };
    }
)(
    class Content extends React.Component {
        state = { limit: null };
        refOrderSelect = node => {
            this.order = node;
        };

        refAccountSelector = node => {
            this.account = node;
        };

        handleOnChangeAmountInput = limit => {
            this.setState({ limit });
        };

        handleSubmit = () => {
            let newAlert = {
                type: this.props.type,
                limit: this.state.limit,
                bankAccount: this.account.getWrappedInstance().select.value,
                order: this.order.value
            };
            this.props.createAlert(newAlert);
        };

        render() {
            const Title = $t(`client.settings.emails.add_${this.props.type}`);

            const isBalanceAlert = this.props.type === 'balance';

            const Body = (
                <React.Fragment>
                    <div className="form-group">
                        <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                        <AccountSelector ref={this.refAccountSelector} id="account" />
                    </div>

                    <div className="form-group">
                        <span>
                            {$t(`client.settings.emails.send_if_${this.props.type}_is`)}&nbsp;
                        </span>

                        <select className="form-control" ref={this.refOrderSelect}>
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
            let disabled = Number.isNaN(Number.parseFloat(this.state.limit));

            const Footer = (
                <React.Fragment>
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={this.props.handleCancel}>
                        {$t('client.general.cancel')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={this.handleSubmit}
                        disabled={disabled}>
                        {$t('client.settings.emails.create')}
                    </button>
                </React.Fragment>
            );
            return <ModalContent title={Title} body={Body} footer={Footer} />;
        }
    }
);
registerModal(MODAL_SLUG, <AlertCreationModal />);

const ShowAlertCreationModal = connect(null, (dispatch, props) => {
    return {
        onClick() {
            actions.showModal(dispatch, MODAL_SLUG, { type: props.alertType });
        }
    };
})(props => {
    return (
        <span
            className="option-legend fa fa-plus-circle"
            aria-label="create alert"
            onClick={props.onClick}
        />
    );
});

ShowAlertCreationModal.propTypes = {
    alertType: PropTypes.oneOf(AlertTypes).isRequired
};

export default ShowAlertCreationModal;
