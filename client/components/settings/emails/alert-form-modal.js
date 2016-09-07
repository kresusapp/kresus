import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, AlertTypes } from '../../../helpers';
import { actions } from '../../../store';

import AccountSelector from './account-select';
import AmountInput from '../../ui/amount-input';

import Modal from '../../ui/modal';

class AlertCreationModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = { limit: null };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOnChangeAmountInput = this.handleOnChangeAmountInput.bind(this);
    }

    handleOnChangeAmountInput(limit) {
        this.setState({ limit });
    }

    // TODO move handleSubmit logic in the above component for making this
    // component a dumb one.
    handleSubmit() {

        let limit = this.state.limit;

        // Actually submit the form
        let newAlert = {
            type: this.props.alertType,
            limit,
            order: this.refs.selector.value,
            bankAccount: this.refs.account.getWrappedInstance().value()
        };

        this.props.createAlert(newAlert);

        // Clear form and errors
        $(`#${this.props.modalId}`).modal('toggle');

        this.setState({ limit: null });
    }

    render() {
        let modalTitle = $t(this.props.titleTranslationKey);
        let isBalanceAlert = this.props.alertType === 'balance';

        let modalBody = (
            <div>
                <div className="form-group">
                    <label htmlFor="account">
                        { $t('client.settings.emails.account') }
                    </label>
                    <AccountSelector
                      ref="account"
                      id="account"
                    />
                </div>

                <div className="form-group">
                    <span>{ this.props.sendIfText }&nbsp;</span>

                    <select
                      className="form-control"
                      ref="selector">
                        <option value="gt">{ $t('client.settings.emails.greater_than') }</option>
                        <option value="lt">{ $t('client.settings.emails.less_than') }</option>
                    </select>
                </div>

                <div className="form-group">
                    <AmountInput
                      defaultValue={ this.state.limit !== null ? Math.abs(this.state.limit) : null }
                      initiallyNegative={ isBalanceAlert && this.state.limit < 0 }
                      togglable={ isBalanceAlert }
                      onChange={ this.handleOnChangeAmountInput }
                      signId={ `sign-${this.props.modalId}` }
                    />
                </div>
            </div>
        );

        let modalFooter = (
            <div>
                <button
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal">
                    { $t('client.settings.emails.cancel') }
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={ this.handleSubmit }
                  disabled={ Number.isNaN(this.state.limit) }>
                    { $t('client.settings.emails.create') }
                </button>
            </div>
        );

        return (
            <Modal
              modalId={ this.props.modalId }
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
            />
        );
    }
}

AlertCreationModal.propTypes = {
    // Type of alert
    alertType: React.PropTypes.oneOf(AlertTypes).isRequired,

    // Modal id
    modalId: React.PropTypes.string.isRequired,

    // Function which create the alert
    createAlert: React.PropTypes.func.isRequired,

    // Translation key of the title.
    titleTranslationKey: React.PropTypes.string.isRequired,

    // Description of the type of alert
    sendIfText: React.PropTypes.string.isRequired
};

export default connect(() => {
    return {};
}, dispatch => {
    return {
        createAlert(newAlert) {
            actions.createAlert(dispatch, newAlert);
        }
    };
})(AlertCreationModal);
