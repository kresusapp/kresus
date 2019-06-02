import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { assert, translate as $t, displayLabel } from '../../../helpers';
import { actions, get } from '../../../store';

import DeleteAlertButton from './confirm-delete-alert';
import AmountInput from '../../ui/amount-input';

class AlertItem extends React.Component {
    // TODO hoist this logic in the above component.
    handleSelect = event => {
        let newValue = event.target.value;
        if (newValue === this.props.alert.order) {
            return;
        }
        this.props.update({ order: newValue });
    };

    handleChangeLimit = value => {
        if (Number.isNaN(value)) {
            this.amountInput.reset();
            return;
        }
        if (Math.abs(value - this.props.alert.limit) <= 0.001) {
            return;
        }
        this.props.update({ limit: value });
    };

    refAmountInput = component => {
        this.amountInput = component;
    };

    render() {
        let { account, alert, access } = this.props;
        let { limit, type, id } = alert;

        assert(alert.order === 'gt' || alert.order === 'lt');

        return (
            <tr>
                <td className="label">{`${displayLabel(access)} − ${displayLabel(account)}`}</td>
                <td className="condition">
                    <span>{this.props.sendIfText}</span>
                </td>
                <td className="amount">
                    <select defaultValue={alert.order} onChange={this.handleSelect}>
                        <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                        <option value="lt">{$t('client.settings.emails.less_than')}</option>
                    </select>

                    <AmountInput
                        ref={this.refAmountInput}
                        defaultValue={Math.abs(limit)}
                        initiallyNegative={limit < 0 && type === 'balance'}
                        onInput={this.handleChangeLimit}
                        togglable={type === 'balance'}
                        signId={`alert-limit-sign-${id}`}
                        currencySymbol={account.currencySymbol}
                        className="input-group-money"
                    />
                </td>
                <td className="actions">
                    <DeleteAlertButton alertId={alert.id} type="alert" />
                </td>
            </tr>
        );
    }
}

AlertItem.propTypes = {
    // Description of the type of alert
    sendIfText: PropTypes.string.isRequired,

    // The alert
    alert: PropTypes.object.isRequired,

    // The account for which the alert is configured
    account: PropTypes.object.isRequired,

    // The alert update function
    update: PropTypes.func.isRequired,

    // The bank access to which is attached the account of the alert
    access: PropTypes.object.isRequired
};

export default connect(
    (state, ownProps) => {
        let access = get.accessById(state, ownProps.account.accessId);
        return { access };
    },
    (dispatch, props) => {
        return {
            update(newFields) {
                actions.updateAlert(dispatch, props.alert.id, newFields);
            }
        };
    }
)(AlertItem);
