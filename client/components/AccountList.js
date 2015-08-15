import React from 'react';

import {store, Actions, State} from '../store';
import T from './Translated';

// Props: account: Account
class AccountListItem extends React.Component {

    constructor(props) {
        super(props);
    }

    onClick() {
        Actions.SelectAccount(this.props.account);
    }
    ComputeTotal(operations) {
        var total = operations
                        .reduce((a,b) => a + b.amount, this.props.account.initialAmount);
        return Math.round(total * 100) / 100;
    }
    render() {
        var maybeActive = this.props.active ? "active" : "";
        return (
            <li className={maybeActive}>
                <span>
                    <a href="#" onClick={this.onClick.bind(this)}>{this.props.account.title}</a> ({this.ComputeTotal(this.props.account.operations)} €)
                </span>
            </li>
        );
    }
}


// State: accounts: [{id: accountId, title: accountTitle}]
export default class AccountListComponent extends React.Component {

    constructor(props) {
        super(props);
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
        var accounts = this.state.accounts.map(function (a) {
            var active = self.state.active == a.id;
            return (
                <AccountListItem key={a.id} account={a} active={active} />
            );
        });

        return (
            <div className="sidebar-list">
                <ul className="sidebar-sublist">
                    <span className="topic">
                        <T k='accounts.title'>Account</T>
                    </span>
                    {accounts}
                </ul>
            </div>
        );
    }
}

