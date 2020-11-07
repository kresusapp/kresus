import React, { useCallback, useRef } from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';
import { registerModal } from '../../ui/modal';

import AccountSelector from '../../ui/account-select';
import ModalContent from '../../ui/modal/content';
import CancelAndSubmit from '../../ui/modal/cancel-and-submit-buttons';

export const MODAL_SLUG = 'report-creation';

const ReportCreationModal = connect(null, dispatch => {
    return {
        async createAlert(newAlert) {
            try {
                await actions.createAlert(dispatch, newAlert);
                actions.hideModal(dispatch);
            } catch (err) {
                // TODO properly report.
            }
        },
    };
})(props => {
    let refSelectFrequency = useRef(null);
    let refSelectAccount = useRef(null);

    let { createAlert } = props;
    let onSubmit = useCallback(
        event => {
            event.preventDefault();
            createAlert({
                type: 'report',
                accountId: refSelectAccount.current.value,
                frequency: refSelectFrequency.current.value,
            });
        },
        [createAlert, refSelectAccount, refSelectFrequency]
    );

    const body = (
        <form id={MODAL_SLUG} onSubmit={onSubmit}>
            <div className="cols-with-label">
                <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                <AccountSelector ref={refSelectAccount} id="account" />
            </div>

            <div className="cols-with-label">
                <label htmlFor="frequency">{$t('client.settings.emails.frequency')}</label>
                <select ref={refSelectFrequency} id="frequency">
                    <option value="daily">{$t('client.settings.emails.daily')}</option>
                    <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                    <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                </select>
            </div>
        </form>
    );

    const footer = (
        <CancelAndSubmit submitLabel={$t('client.settings.emails.create')} formId={MODAL_SLUG} />
    );

    return (
        <ModalContent title={$t('client.settings.emails.add_report')} body={body} footer={footer} />
    );
});

registerModal(MODAL_SLUG, () => <ReportCreationModal />);
