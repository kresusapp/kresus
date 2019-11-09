import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, displayLabel } from '../../../helpers';
import { actions, get } from '../../../store';
import { registerModal } from '../../ui/modal';

import CancelAndWarn from '../../ui/modal/cancel-and-warn-buttons';
import ModalContent from '../../ui/modal/content';

const SyncBalanceModal = connect(
    state => {
        let accountId = get.modal(state).state;
        let account = get.accountById(state, accountId);
        let label = account ? displayLabel(account) : null;
        return {
            label,
            accountId
        };
    },
    dispatch => {
        return {
            async resyncBalance(accountId) {
                try {
                    await actions.resyncBalance(dispatch, accountId);
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO properly report.
                }
            }
        };
    },
    ({ label, accountId }, { resyncBalance }) => {
        return {
            label,
            async handleConfirm() {
                await resyncBalance(accountId);
            }
        };
    }
)(props => {
    const title = $t('client.settings.resync_account.title', { label: props.label });
    const body = (
        <React.Fragment>
            {$t('client.settings.resync_account.make_sure')}
            <ul className="bullet">
                <li>{$t('client.settings.resync_account.sync_operations')}</li>
                <li>{$t('client.settings.resync_account.manage_duplicates')}</li>
                <li>{$t('client.settings.resync_account.add_operation')}</li>
                <li>{$t('client.settings.resync_account.delete_operation')}</li>
            </ul>
            {$t('client.settings.resync_account.are_you_sure')}
        </React.Fragment>
    );
    const footer = (
        <CancelAndWarn
            onConfirm={props.handleConfirm}
            warningLabel={$t('client.settings.resync_account.submit')}
        />
    );
    return <ModalContent title={title} body={body} footer={footer} />;
});

export const SYNC_ACCOUNT_MODAL_SLUG = 'sync-account-balance';

registerModal(SYNC_ACCOUNT_MODAL_SLUG, () => <SyncBalanceModal />);
