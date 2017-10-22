import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import Modal from '../../ui/modal';

import AccountSelector from './account-select';

const ReportCreationModal = props => {
    let accountSelector = null;
    let frequencySelector = null;

    const handleCreate = () => {
        let newAlert = {
            type: 'report',
            bankAccount: accountSelector.getWrappedInstance().value(),
            frequency: frequencySelector.value
        };

        props.createAlert(newAlert);
    };

    let modalTitle = $t('client.settings.emails.add_report');

    let refAccountSelector = selector => {
        accountSelector = selector;
    };
    let refFrequencySelector = input => {
        frequencySelector = input;
    };

    let modalBody = (
        <div>
            <div className="form-group">
                <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                <AccountSelector ref={refAccountSelector} id="account" />
            </div>

            <div className="form-group">
                <span>{$t('client.settings.emails.send_report')}&nbsp;</span>

                <select className="form-control" ref={refFrequencySelector}>
                    <option value="daily">{$t('client.settings.emails.daily')}</option>
                    <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                    <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                </select>
            </div>
        </div>
    );

    let modalFooter = (
        <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                {$t('client.general.cancel')}
            </button>
            <button
                type="button"
                className="btn btn-success"
                data-dismiss="modal"
                onClick={handleCreate}>
                {$t('client.settings.emails.create')}
            </button>
        </div>
    );

    return (
        <Modal
            modalId="report-creation"
            modalTitle={modalTitle}
            modalBody={modalBody}
            modalFooter={modalFooter}
        />
    );
};

export default connect(null, dispatch => {
    return {
        createAlert(newAlert) {
            actions.createAlert(dispatch, newAlert);
        }
    };
})(ReportCreationModal);
