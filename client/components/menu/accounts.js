import React from 'react';
import { connect } from 'react-redux';

import { store, Actions, State } from '../../store';
import * as Ui from '../../store/ui';
import { has } from '../../helpers';

function computeTotal(operations, initial) {
    let total = operations.reduce((a, b) => a + b.amount, initial);
    return Math.round(total * 100) / 100;
}

let AccountListItem = connect(state => {
    return {};
}, dispatch => {
    return {
        handleClick: account => {
            Actions.selectAccount(account);
        }
    }
})(props => {
    let maybeActive = props.active ? 'active' : '';
    let formatCurrency = props.account.formatCurrency;
    let total = computeTotal(props.account.operations, props.account.initialAmount);
    return (
        <li className={ maybeActive }>
            <span>
                <a href="#" onClick={ () => props.handleClick(props.account) }>
                    { props.account.title }
                </a>
                <span>
                    &nbsp;
                    { formatCurrency(total) }
                </span>
            </span>
        </li>
    );
});

let AccountActiveItem = props => {
    let total = computeTotal(props.account.operations, props.account.initialAmount);
    let color = total >= 0 ? 'positive' : 'negative';
    let formatCurrency = props.account.formatCurrency;

    return (
        <div className="account-details">
            <div className="account-name">
                <a href="#" onClick={ () => props.handleClick(props.account) }>
                    { props.account.title }
                    <span className="amount">
                        <span className={ color }>{ formatCurrency(total) }</span>
                    </span>
                    <span className="caret"></span>
                </a>
            </div>
        </div>
    );
};

// State: accounts: [{id: accountId, title: accountTitle}]
class AccountListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accounts: store.getCurrentBankAccounts(),
            showDropdown: false
        };
        this.listener = this.listener.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown });
    }

    listener() {
        this.setState({
            accounts: store.getCurrentBankAccounts(),
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
                        .filter(account => this.props.active === account.id)
                        .map(account => (
                            <AccountActiveItem
                              key={ account.id }
                              account={ account }
                              handleClick={ this.toggleDropdown }
                            />
                        )
        );

        let accounts = this.state.accounts.map(account => {
            let isActive = this.props.active === account.id;
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

const Export = connect(state => {
    return {
        // TODO make this more pretty
        active: Ui.getCurrentAccountId(state.ui)
    };
}, dispatch => {
    return {};
})(AccountListComponent);

export default Export;
