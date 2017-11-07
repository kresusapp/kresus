import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, AlertTypes } from '../../../helpers';
import { get, actions } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import AccountSelector from './account-select';
import AmountInput from '../../ui/amount-input';

const MODAL_SLUG = 'create-alert';

const Title = connect(state => {
    return {
        type: get.modal(state).state.type
    };
})(props => {
    return <span>{$t(`client.settings.emails.add_${props.type}`)}</span>;
});

const Body = connect(
    state => {
        let modalState = get.modal(state).state;
        return {
            ...modalState
        };
    },
    dispatch => ({ dispatch }),
    (stateToProps, { dispatch }) => {
        return {
            limit: stateToProps.limit,
            type: stateToProps.type,
            onChangeAccount(bankAccount) {
                actions.showModal(dispatch, MODAL_SLUG, { ...stateToProps, bankAccount });
            },
            onChangeSign(event) {
                actions.showModal(dispatch, MODAL_SLUG, {
                    ...stateToProps,
                    order: event.target.value
                });
            },
            handleOnChangeAmountInput(limit) {
                actions.showModal(dispatch, MODAL_SLUG, { ...stateToProps, limit });
            }
        };
    }
)(props => {
    const isBalanceAlert = props.type === 'balance';

    return (
        <div>
            <div className="form-group">
                <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                <AccountSelector onChange={props.onChangeAccount} id="account" />
            </div>

            <div className="form-group">
                <span>{$t(`client.settings.emails.send_if_${props.type}_is`)}&nbsp;</span>

                <select className="form-control" onChange={props.onChangeSign}>
                    <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                    <option value="lt">{$t('client.settings.emails.less_than')}</option>
                </select>
            </div>

            <div className="form-group">
                <AmountInput
                    defaultValue={props.limit !== null ? Math.abs(props.limit) : null}
                    initiallyNegative={isBalanceAlert && props.limit < 0}
                    togglable={isBalanceAlert}
                    onChange={props.handleOnChangeAmountInput}
                    signId="sign-alerd"
                />
            </div>
        </div>
    );
});

const Footer = connect(
    state => {
        return {
            ...get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    (stateToProps, dispatchToProps) => {
        return {
            handleSubmit() {
                actions.createAlert(dispatchToProps.dispatch, stateToProps);
            },
            handleCancel() {
                actions.hideModal(dispatchToProps.dispatch);
            },
            disabled: Number.isNaN(stateToProps.limit)
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button
                type="button"
                className="btn btn-success"
                onClick={props.handleSubmit}
                disabled={props.disabled}>
                {$t('client.settings.emails.create')}
            </button>
        </div>
    );
});

registerModal(MODAL_SLUG, () => {
    return {
        title: <Title />,
        body: <Body />,
        footer: <Footer />
    };
});

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
