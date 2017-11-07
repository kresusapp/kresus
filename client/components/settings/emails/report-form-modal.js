import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import AccountSelector from './account-select';
import ModalContent from '../../ui/modal-content';

const MODAL_SLUG = 'report-creation';

const ReportCreationModal = connect(null, dispatch => {
    return {
        createAlert(newAlert) {
            actions.createAlert(dispatch, newAlert);
        },
        handleCancel() {
            actions.hideModal(dispatch);
        }
    };
})(
    class Content extends React.Component {
        refFrequencySelect = node => {
            this.frequency = node;
        };

        refAccountSelector = node => {
            this.account = node;
        };

        handleSubmit = () => {
            let newAlert = {
                bankAccount: this.account.getWrappedInstance().select.value,
                type: 'report',
                frequency: this.frequency.value
            };
            this.props.createAlert(newAlert);
        };

        render() {
            const Body = (
                <React.Fragment>
                    <div className="form-group">
                        <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                        <AccountSelector ref={this.refAccountSelector} id="account" />
                    </div>

                    <select ref={this.refFrequencySelect} className="form-control">
                        <option value="daily">{$t('client.settings.emails.daily')}</option>
                        <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                        <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                    </select>
                </React.Fragment>
            );
            const Footer = (
                <React.Fragment>
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={this.props.handleCancel}>
                        {$t('client.general.cancel')}
                    </button>
                    <button type="button" className="btn btn-success" onClick={this.handleSubmit}>
                        {$t('client.settings.emails.create')}
                    </button>
                </React.Fragment>
            );

            return (
                <ModalContent
                    title={$t('client.settings.emails.add_report')}
                    body={Body}
                    footer={Footer}
                />
            );
        }
    }
);

registerModal(MODAL_SLUG, <ReportCreationModal />);

const ShowReportCreationModal = connect(null, dispatch => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, { type: 'report' });
        }
    };
})(props => {
    return (
        <span
            className="option-legend fa fa-plus-circle"
            aria-label="create report"
            onClick={props.handleClick}
        />
    );
});

export default ShowReportCreationModal;
