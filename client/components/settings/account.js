import { translate as $t } from '../../helpers';
import { Actions, store, State } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

import AddOperationModal from './add-operation-modal';

export default class Account extends React.Component {

    constructor(props) {
        super(props);
        this.listener = this._listener.bind(this);
        this.handleSetDefault = this.handleSetDefault.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    _listener() {
        this.forceUpdate();
    }

    componentDidMount() {
        store.on(State.settings, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.settings, this.listener);
    }

    handleDelete() {
        Actions.deleteAccount(this.props.account);
    }

    handleSetDefault() {
        Actions.changeSetting('defaultAccountId', this.props.account.id);
    }

    render() {
        let a = this.props.account;
        let label = a.iban ? `${a.title} (IBAN: ${a.iban})` : a.title;
        let setDefaultAccountTitle;
        let selected;

        if (store.getDefaultAccountId() === this.props.account.id) {
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
                      onDelete={ this.handleDelete }
                    />
                    <AddOperationModal
                      account={ a }
                    />
                </td>
            </tr>
        );
    }
}
