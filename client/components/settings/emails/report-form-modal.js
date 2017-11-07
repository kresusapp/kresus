import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import AccountSelector from './account-select';
import ModalContent from '../../ui/new-modal/content';
import SaveAndCancel from '../../ui/new-modal/save-and-cancel-buttons';

const MODAL_SLUG = 'report-creation';

const ReportCreationModal = connect(
    null,
    dispatch => {
        return {
            createAlert(newAlert) {
                actions.createAlert(dispatch, newAlert);
            }
        };
    }
)(
    class Content extends React.Component {
        refFrequencySelect = node => (this.frequency = node);
        refAccountSelector = node => (this.account = node);

        handleSubmit = () => {
            let newAlert = {
                accountId: this.account.getWrappedInstance().value(),
                type: 'report',
                frequency: this.frequency.value
            };
            this.props.createAlert(newAlert);
        };

        render() {
            const body = (
                <React.Fragment>
                    <div className="form-group">
                        <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                        <AccountSelector ref={this.refAccountSelector} id="account" />
                    </div>

                    <select className="form-element-block" ref={this.refFrequencySelect}>
                        <option value="daily">{$t('client.settings.emails.daily')}</option>
                        <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                        <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                    </select>
                </React.Fragment>
            );
            const footer = (
                <SaveAndCancel
                    onClickSave={this.handleSubmit}
                    saveLabel={$t('client.settings.emails.create')}
                />
            );

            return (
                <ModalContent
                    title={$t('client.settings.emails.add_report')}
                    body={body}
                    footer={footer}
                />
            );
        }
    }
);

registerModal(MODAL_SLUG, () => <ReportCreationModal />);

const ShowReportCreationModal = connect(
    null,
    dispatch => {
        return {
            handleClick() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => {
    return (
        <button
            className="fa fa-plus-circle"
            aria-label="create report"
            onClick={props.handleClick}
        />
    );
});

export default ShowReportCreationModal;
