import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import ConfirmDeleteModal from '../../ui/confirm-delete-modal';
import AddOperationModal from './add-operation-modal';
import SyncAccountBalanceModal from './sync-account-balance-modal';

const formatIBAN = function(iban) {
    return iban.replace(/(.{4})(?!$)/g,  '$1\xa0');
};

export default connect(state => {
    let defaultAccountId = get.setting(state, 'defaultAccountId');
    return {
        defaultAccountId
    };
}, (dispatch, props) => {
    return {
        handleDeleteAccount: () => {
            actions.deleteAccount(dispatch, props.account.id);
        },
        handleSetDefault: () => {
            actions.setSetting(dispatch, 'defaultAccountId', props.account.id);
        }
    };
})(props => {
    let a = props.account;

    let label = a.iban ? `${a.title} (IBAN\xa0:\xa0${formatIBAN(a.iban)})` : a.title;

    let selected;
    let setDefaultAccountTitle;

    if (props.defaultAccountId === a.id) {
        setDefaultAccountTitle = '';
        selected = 'fa-star';
    } else {
        setDefaultAccountTitle = $t('client.settings.set_default_account');
        selected = 'fa-star-o';
    }

    return (
        <tr key={ `settings-bank-accesses-account-${a.id}` }>
            <td>
                <span
                  className={ `clickable fa ${selected}` }
                  aria-hidden="true"
                  onClick={ props.handleSetDefault }
                  title={ setDefaultAccountTitle }
                />
            </td>
            <td>{ label }</td>
            <td>
                <span
                  className="pull-right fa fa-times-circle" aria-label="remove"
                  data-toggle="modal"
                  data-target={ `#confirmDeleteAccount${a.id}` }
                  title={ $t('client.settings.delete_account_button') }
                />
                <span
                  className="pull-right fa fa-plus-circle" aria-label="Add an operation"
                  data-toggle="modal"
                  data-target={ `#addOperation${a.id}` }
                  title={ $t('client.settings.add_operation') }
                />
                <span
                  className="pull-right fa fa-cog" aria-label="Resync account balance"
                  data-toggle="modal"
                  data-target={ `#syncBalanceModal${a.id}` }
                  title={ $t('client.settings.resync_account_button') }
                />
                <ConfirmDeleteModal
                  modalId={ `confirmDeleteAccount${a.id}` }
                  modalBody={ $t('client.settings.erase_account', { title: a.title }) }
                  onDelete={ props.handleDeleteAccount }
                />
                <AddOperationModal
                  account={ a }
                  modalId={ `addOperation${a.id}` }
                />
                <SyncAccountBalanceModal
                  account={ a }
                  modalId={ `syncBalanceModal${a.id}` }
                />
            </td>
        </tr>
    );
});
