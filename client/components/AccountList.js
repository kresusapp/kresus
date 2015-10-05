import {store, Actions, State} from '../store';
import {has} from '../Helpers';
import T from './Translated';

// Props: account: Account
class AccountListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick() {
        Actions.SelectAccount(this.props.account);
    }
    
    computeTotal(operations) {
        var total = operations
                        .reduce((a,b) => a + b.amount, this.props.account.initialAmount);
        return Math.round(total * 100) / 100;
    }
    
    render() {
        var maybeActive = this.props.active ? "active" : "";
        return (
            <li className={maybeActive}>
                <span>
                    <a href="#" onClick={this.onClick.bind(this)}>{this.props.account.title}</a> ({this.computeTotal(this.props.account.operations)} €)
                </span>
            </li>
        );
    }
}

class AccountActiveItem extends AccountListItem {

    constructor(props) {
        super(props);
        has(props, 'toggleDropdown');
    }

    render() {
        var total = super.computeTotal(this.props.account.operations);
        var color = total >= 0 ? 'positive' : 'negative';
        
        return (
            <div className="account-details">
                <a href="#" onClick={this.props.toggleDropdown}>
                    {this.props.account.title}
                    <span className="amount">
                        [<span className={color}>{total} €</span>]
                    </span>
                    <span className="caret"></span>
                </a>
            </div>
        );
    }
}

// State: accounts: [{id: accountId, title: accountTitle}]
export default class AccountListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: [],
            active: null,
            showDropdown: false
        };
        this.listener = this._listener.bind(this);
    }
    
    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown});
        e.preventDefault();
    }

    _listener() {
        this.setState({
            accounts: store.getCurrentBankAccounts(),
            active: store.getCurrentAccountId()
        });
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.operations, this.listener);
        store.subscribeMaybeGet(State.accounts, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.accounts, this.listener);
        store.removeListener(State.operations, this.listener);
    }

    render() {
        var self = this;
        
        var active = this.state.accounts.filter((account) => {
            return this.state.active == account.id;
        }).map((account) => {
            return (
                <AccountActiveItem key={account.id} account={account} 
                    toggleDropdown={this.toggleDropdown.bind(this)}/>
            );
        });
        
        var accounts = this.state.accounts.map(function (account) {
            var active = self.state.active == account.id;
            return (
                <AccountListItem key={account.id} account={account} active={active} />
            );
        });

    var maybeOpen = this.state.showDropdown ? "open" : "";

        return (
            <div className="accounts sidebar-list">
                {active}
                
                <ul className={ "dropdown " + maybeOpen }>
                    {accounts}
                </ul>
            </div>
        );
    }
}
