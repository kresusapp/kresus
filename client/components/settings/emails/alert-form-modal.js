import React from 'react';
import { connect } from 'react-redux';

import { assertHas, translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import AccountSelector from './account-select';
import AmountInput from '../../ui/amount-input';

import Modal from '../../ui/modal';

class AlertCreationModal extends React.Component {

    constructor(props) {
        assertHas(props, 'alertType');
        assertHas(props, 'modalId');
        assertHas(props, 'titleTranslationKey');
        assertHas(props, 'sendIfText');
        super(props);
        this.state = { maybeLimitError: '' };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // TODO move handleSubmit logic in the above component for making this
    // component a dumb one.
    handleSubmit() {

        // Validate data
        let limitDom = this.refs.limit;
        let limit = parseFloat(limitDom.getValue());
        if (isNaN(limit)) {
            this.setState({
                maybeLimitError: $t('client.settings.emails.invalid_limit')
            });
            return;
        }

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

        limitDom.setValue(0);
        if (this.state.maybeLimitError.length) {
            this.setState({ maybeLimitError: '' });
        }
    }

    render() {
        let modalTitle = $t(this.props.titleTranslationKey);

        let modalBody = (
            <div>
                <div className="form-group">
                    <label htmlFor="account">
                        { $t('client.settings.emails.account') }
                    </label>
                    <AccountSelector ref="account" id="account" />
                </div>

                <div className="form-group">
                    <span>{ this.props.sendIfText }&nbsp;</span>

                    <select className="form-control" ref="selector">
                        <option value="gt">{ $t('client.settings.emails.greater_than') }</option>
                        <option value="lt">{ $t('client.settings.emails.less_than') }</option>
                    </select>
                </div>

                <div className="form-group">
                    <span className="text-danger">{ this.state.maybeLimitError }</span>
                    <AmountInput
                      ref="limit"
                      defaultValue={ 0 }
                      defaultSign="+"
                      togglable={ this.props.alertType === 'balance' }
                      minValue={ this.props.alertType === 'balance' ? '' : 0 }
                    />
                </div>
            </div>
        );

        let modalFooter = (
            <div>
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    { $t('client.settings.emails.cancel') }
                </button>
                <button type="button" className="btn btn-success"
                  onClick={ this.handleSubmit }>
                    { $t('client.settings.emails.create') }
                </button>
            </div>
        );

        return (
            <Modal modalId={ this.props.modalId }
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
            />
        );
    }
}

export default connect(() => {
    return {};
}, dispatch => {
    return {
        createAlert(newAlert) {
            actions.createAlert(dispatch, newAlert);
        }
    };
})(AlertCreationModal);
