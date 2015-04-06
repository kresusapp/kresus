// Constants
import {debug, translate as t} from '../Helpers';

// Global variables
import {store, Actions, State} from '../store';

// Props: account: Account
class AccountListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick() {
        Actions.SelectAccount(this.props.account);
    }

    render() {
        var maybeActive = this.props.active ? "active" : "";
        return (
            <li className={maybeActive}>
                <span>
                    <a href="#" onClick={this.onClick.bind(this)}>{this.props.account.title}</a>
                </span>
            </li>
        );
    }
}


// State: accounts: [{id: accountId, title: accountTitle}]
export default class AccountListComponent extends React.Component {

    constructor() {
        this.state = {
            accounts: [],
            active: null
        };
        this.listener = this._listener.bind(this);
    }

    _listener() {
        this.setState({
            accounts: store.getCurrentBankAccounts(),
            active: store.getCurrentAccountId()
        });
    }

    componentDidMount() {
        store.on(State.accounts, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.accounts, this.listener);
    }

    render() {
        var self = this;
        var accounts = this.state.accounts.map(function (a) {
            var active = self.state.active == a.id;
            return (
                <AccountListItem key={a.id} account={a} active={active} />
            );
        });

        return (
            <div className="sidebar-list">
                <ul className="sidebar-sublist"><span className="topic">{t('Accounts')}</span>
                    {accounts}
                </ul>
            </div>
        );
    }
}

