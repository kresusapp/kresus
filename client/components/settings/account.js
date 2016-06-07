import React from 'react';
import { connect } from 'react-redux';

import { has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

import AddOperationModal from './add-operation-modal';

export default Account = connect(state => {
    // TODO hide better the state's shape.
    let defaultAccountId = state.settings.map['defaultAccountId'];
    return {
        defaultAccountId
    }
}, dispatch => {
    // TODO use dispatch here directly
    return {
        deleteAccount: account => {
            Actions.deleteAccount(account);
        },
        changeDefaultAccountId: id => {
            Actions.changeSetting('defaultAccountId', id);
        }
    }
})(props => {
    let a = props.account;

    let label = a.iban ? `${a.title} (IBAN: ${a.iban})` : a.title;

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
        <tr>
            <td>
                <span className={ `clickable fa ${selected}` }
                  aria-hidden="true"
                  onClick={ () => props.changeDefaultAccountId(props.account.id) }
                  title={ setDefaultAccountTitle }>
                </span>
            </td>
            <td>{ label }</td>
            <td>
                <span className="pull-right fa fa-times-circle" aria-label="remove"
                  data-toggle="modal"
                  data-target={ `#confirmDeleteAccount${a.id}` }
                  title={ $t('client.settings.delete_account_button') }>
                </span>
                <span className="pull-right fa fa-plus-circle" aria-label="Add an operation"
                  data-toggle="modal"
                  data-target={ `#addOperation${a.id}` }
                  title={ $t('client.settings.add_operation') }>
                </span>
                <ConfirmDeleteModal
                  modalId={ `confirmDeleteAccount${a.id}` }
                  modalBody={ $t('client.settings.erase_account', { title: a.title }) }
                  onDelete={ () => props.deleteAccount(props.account) }
                />
                <AddOperationModal
                  account={ a }
                />
            </td>
        </tr>
    );
});
