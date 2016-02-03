import { store, Actions, State } from '../../store';
import { has } from '../../helpers';

// Props: account: Account
class AccountListItem extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        Actions.selectAccount(this.props.account);
    }

    computeTotal(operations) {
        let total = operations
                        .reduce((a, b) => a + b.amount, this.props.account.initialAmount);
        return Math.round(total * 100) / 100;
    }

    render() {
        let maybeActive = this.props.active ? 'active' : '';
        return (
            <li className={ maybeActive }>
                <span>
                    <a href="#" onClick={ this.handleClick }>{ this.props.account.title }</a>
                    ({ this.computeTotal(this.props.account.operations) } €)
                </span>
            </li>
        );
    }
}

class AccountActiveItem extends AccountListItem {

    constructor(props) {
        super(props);
        has(props, 'handleClick');
    }

    render() {
        let total = super.computeTotal(this.props.account.operations);
        let color = total >= 0 ? 'positive' : 'negative';

        return (
            <div className="account-details">
                <div className="account-name">
                    <a href="#" onClick={ this.props.handleClick }>
                        { this.props.account.title }
                        <span className="amount">
                            [<span className={ color }>{ total } €</span>]
                        </span>
                        <span className="caret"></span>
                    </a>
                </div>
            </div>
        );
    }
}

// State: accounts: [{id: accountId, title: accountTitle}]
export default class AccountListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: store.getCurrentBankAccounts(),
            active: store.getCurrentAccountId(),
            showDropdown: false
        };
        this.listener = this.listener.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown });
        e.preventDefault();
    }

    listener() {
        this.setState({
            accounts: store.getCurrentBankAccounts(),
            active: store.getCurrentAccountId()
        });
    }

    componentDidMount() {
        store.on(State.banks, this.listener);
        store.on(State.operations, this.listener);
        store.on(State.accounts, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.listener);
        store.removeListener(State.accounts, this.listener);
        store.removeListener(State.operations, this.listener);
    }

    render() {
        let active = this.state.accounts
                        .filter(account => this.state.active === account.id)
                        .map(account => (
                            <AccountActiveItem
                              key={ account.id }
                              account={ account }
                              handleClick={ this.toggleDropdown }
                            />
                        )
        );

        let accounts = this.state.accounts.map(account => {
            let isActive = this.state.active === account.id;
            return (
                <AccountListItem key={ account.id } account={ account } active={ isActive } />
            );
        });

        let menu = this.state.showDropdown ? '' : 'dropdown-menu';
        let dropdown = this.state.showDropdown ? 'dropup' : 'dropdown';

        return (
            <div className={ `accounts sidebar-list ${dropdown} ` }>
                { active }
                <ul className={ menu }>{ accounts }</ul>
            </div>
        );
    }
}
