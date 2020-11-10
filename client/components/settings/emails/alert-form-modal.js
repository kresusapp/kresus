import React, { useCallback, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';
import { registerModal } from '../../ui/modal';

import AccountSelector from '../../ui/account-select';
import AmountInput from '../../ui/amount-input';
import ModalContent from '../../ui/modal/content';
import CancelAndSubmit from '../../ui/modal/cancel-and-submit-buttons';

export const MODAL_SLUG = 'create-alert';

const AlertCreationModal = connect(
    state => {
        return {
            type: get.modal(state).state,
        };
    },
    dispatch => {
        return {
            async createAlert(alert) {
                try {
                    await actions.createAlert(dispatch, alert);
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO properly report.
                }
            },
        };
    }
)(props => {
    let [limit, setLimit] = useState(Number.NaN);

    let refSelectOrder = useRef(null);
    let refSelectAccount = useRef(null);

    const { createAlert, type } = props;
    let onSubmit = useCallback(
        event => {
            event.preventDefault();
            createAlert({
                type,
                limit,
                accountId: refSelectAccount.current.value,
                order: refSelectOrder.current.value,
            });
        },
        [createAlert, type, limit, refSelectOrder, refSelectAccount]
    );

    const title = $t(`client.settings.emails.add_${type}`);
    const isBalanceAlert = type === 'balance';

    const body = (
        <form id={MODAL_SLUG} onSubmit={onSubmit}>
            <div className="cols-with-label">
                <label htmlFor="account">{$t('client.settings.emails.account')}</label>
                <AccountSelector ref={refSelectAccount} id="account" />
            </div>

            <div className="cols-with-label">
                <label htmlFor="order-select">
                    {$t(`client.settings.emails.send_if_${type}_is`)}&nbsp;
                </label>

                <div className="balance-inputs">
                    <select id="order-select" ref={refSelectOrder}>
                        <option value="gt">{$t('client.settings.emails.greater_than')}</option>
                        <option value="lt">{$t('client.settings.emails.less_than')}</option>
                    </select>

                    <AmountInput
                        defaultValue={limit !== null ? Math.abs(limit) : null}
                        initiallyNegative={isBalanceAlert && limit < 0}
                        togglable={isBalanceAlert}
                        onChange={setLimit}
                        signId="sign-alert"
                    />
                </div>
            </div>
        </form>
    );

    let isSubmitDisabled = Number.isNaN(limit);

    const footer = (
        <CancelAndSubmit
            isSubmitDisabled={isSubmitDisabled}
            submitLabel={$t('client.settings.emails.create')}
            formId={MODAL_SLUG}
        />
    );

    return <ModalContent title={title} body={body} footer={footer} />;
});

registerModal(MODAL_SLUG, () => <AlertCreationModal />);
