import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import Modal from '../../ui/modal';

let SyncAccountBalanceModal = props => {
    let modalId = props.modalId;

    let modalTitle = $t('client.settings.resync_account.title', { title: props.account.title });

    let modalBody = (
        <div>
            {$t('client.settings.resync_account.make_sure')}
            <ul className="bullet">
                <li>{$t('client.settings.resync_account.sync_operations')}</li>
                <li>{$t('client.settings.resync_account.manage_duplicates')}</li>
                <li>{$t('client.settings.resync_account.add_operation')}</li>
                <li>{$t('client.settings.resync_account.delete_operation')}</li>
            </ul>
            {$t('client.settings.resync_account.are_you_sure')}
        </div>
    );

    let modalFooter = (
        <div>
            <input
                type="button"
                className="btn btn-default"
                data-dismiss="modal"
                value={$t('client.general.cancel')}
            />
            <input
                type="button"
                className="btn btn-warning"
                onClick={props.handleResyncBalance}
                data-dismiss="modal"
                value={$t('client.settings.resync_account.submit')}
            />
        </div>
    );

    return (
        <Modal
            key={modalId}
            modalId={modalId}
            modalBody={modalBody}
            modalTitle={modalTitle}
            modalFooter={modalFooter}
        />
    );
};

SyncAccountBalanceModal.propTypes = {
    // Unique identifier of the modal
    modalId: PropTypes.string.isRequired,

    // The account to be resynced. (instanceof Account)
    account: PropTypes.object.isRequired
};

const Export = connect(
    null,
    (dispatch, props) => {
        return {
            handleResyncBalance: () => {
                actions.resyncBalance(dispatch, props.account.id);
            }
        };
    }
)(SyncAccountBalanceModal);

export default Export;
