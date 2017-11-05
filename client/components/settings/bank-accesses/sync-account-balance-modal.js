import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';
import { registerModal } from '../../ui/new-modal';

import CancelAndWarning from '../../ui/modal-cancel-and-warning-button';
import ModalContent from '../../ui/modal-content';

const MODAL_SLUG = 'sync-account-balance';

const SyncBalanceModal = connect(
    state => {
        let accountId = get.modal(state).state;
        let { title } = get.accountById(state, accountId);
        return {
            title,
            accountId
        };
    },
    dispatch => {
        return {
            makeHandleClickWarning(accountId) {
                actions.resyncBalance(dispatch, accountId);
            }
        };
    },
    ({ title, accountId }, { makeHandleClickWarning }) => {
        return {
            title,
            handleClickWarning() {
                makeHandleClickWarning(accountId);
            }
        };
    }
)(props => {
    const title = $t('client.settings.resync_account.title', { title: props.title });
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
        <CancelAndWarning
            onClickWarning={props.handleClickWarning}
            warningLabel={$t('client.settings.resync_account.submit')}
        />
    );
    return <ModalContent title={title} body={body} footer={footer} />;
});

registerModal(MODAL_SLUG, <SyncBalanceModal />);

const SyncAccountButton = connect(null, (dispatch, props) => {
    return {
        handleShowSyncModal() {
            actions.showModal(dispatch, 'sync-account-balance', props.accountId);
        }
    };
})(props => {
    return (
        <button
            className="pull-right fa fa-cog"
            aria-label="Resync account balance"
            onClick={props.handleShowSyncModal}
            title={$t('client.settings.resync_account_button')}
        />
    );
});

SyncAccountButton.propTypes = {
    // The unique identifier of the account for which the balance has to be synced.
    accountId: PropTypes.string.isRequired
};

export default SyncAccountButton;
