import React from 'react';
import { connect } from 'react-redux';

import { has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

import AddOperationModal from './add-operation-modal';

class Account extends React.Component {

    constructor(props) {
        has(props, 'account');
        super(props);
        this.handleSetDefault = this.handleSetDefault.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.deleteAccount(this.props.account);
    }

    handleSetDefault() {
        this.props.changeDefaultAccountId(this.props.account.id);
    }

    render() {
        let a = this.props.account;

        let label = a.iban ? `${a.title} (IBAN: ${a.iban})` : a.title;

        let selected;
        let setDefaultAccountTitle;
        if (this.props.defaultAccountId === a.id) {
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
                      onClick={ this.handleSetDefault }
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
                      onDelete={ this.props.handleDelete }
                    />
                    <AddOperationModal
                      account={ a }
                    />
                </td>
            </tr>
        );
    }
}

const mapStateToProps = state => {
    let defaultAccountId = state.settings.map['defaultAccountId'];
    return {
        defaultAccountId
    }
};

const mapDispatchToProps = dispatch => {
    return {
        handleDelete: (account) => {
            Actions.deleteAccount(account);
        },
        changeDefaultAccountId: (id) => {
            Actions.changeSetting('defaultAccountId', id);
        }
    }
};

const Export = connect(mapStateToProps, mapDispatchToProps)(Account);

export default Export;
