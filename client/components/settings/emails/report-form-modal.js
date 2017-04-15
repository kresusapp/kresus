import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import Modal from '../../ui/modal';

import AccountSelector from './account-select';

class ReportCreationModal extends React.Component {

    constructor(props) {
        super(props);
        this.handleCreate = this.handleCreate.bind(this);

        this.accountSelector = null;
        this.frequencySelector = null;
    }

    handleCreate() {

        let newAlert = {
            type: 'report',
            bankAccount: this.accountSelector.getWrappedInstance().value(),
            frequency: this.frequencySelector.value
        };

        this.props.createAlert(newAlert);
    }

    render() {
        let modalTitle = $t('client.settings.emails.add_report');
        let accountSelectorCb = selector => {
            this.accountSelector = selector;
        };
        let frequencySelectorCb = input => {
            this.frequencySelector = input;
        };

        let modalBody = (
            <div>
                <div className="form-group">
                    <label htmlFor="account">
                        { $t('client.settings.emails.account') }
                    </label>
                    <AccountSelector
                      ref={ accountSelectorCb }
                      id="account"
                    />
                </div>

                <div className="form-group">
                    <span>{ $t('client.settings.emails.send_report') }&nbsp;</span>

                    <select
                      className="form-control"
                      ref={ frequencySelectorCb }>
                        <option value="daily">
                            { $t('client.settings.emails.daily') }
                        </option>
                        <option value="weekly">
                            { $t('client.settings.emails.weekly') }
                        </option>
                        <option value="monthly">
                            { $t('client.settings.emails.monthly') }
                        </option>
                    </select>
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
                  data-dismiss="modal"
                  onClick={ this.handleCreate }>
                    { $t('client.settings.emails.create') }
                </button>
            </div>
        );

        return (
            <Modal
              modalId="report-creation"
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
})(ReportCreationModal);
