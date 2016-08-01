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
    }

    handleCreate() {

        let newAlert = {
            type: 'report',
            bankAccount: this.refs.account.getWrappedInstance().value(),
            frequency: this.refs.selector.value
        };

        this.props.createAlert(newAlert);
    }

    render() {
        let modalTitle = $t('client.settings.emails.add_report');

        let modalBody = (
            <div>
                <div className="form-group">
                    <label htmlFor="account">
                        { $t('client.settings.emails.account') }
                    </label>
                    <AccountSelector ref="account" id="account" />
                </div>

                <div className="form-group">
                    <span>{ $t('client.settings.emails.send_report') }&nbsp;</span>

                    <select className="form-control" ref="selector">
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
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    { $t('client.settings.emails.cancel') }
                </button>
                <button type="button" className="btn btn-success" data-dismiss="modal"
                  onClick={ this.handleCreate }>
                    { $t('client.settings.emails.create') }
                </button>
            </div>
        );

        return (
            <Modal modalId="report-creation"
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
            />
       );
    }
}

export default connect(state => {
    return {};
}, dispatch => {
    return {
        createAlert(newAlert) { actions.createAlert(dispatch, newAlert); }
    };
})(ReportCreationModal);
