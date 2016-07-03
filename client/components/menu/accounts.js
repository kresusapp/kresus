import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
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
            actions.setCurrentAccountId(dispatch, account.id);
        }
    }
})(props => {
    let maybeActive = props.active ? 'active' : '';
    let formatCurrency = props.account.formatCurrency;
    let total = computeTotal(props.operations, props.account.initialAmount);
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
    let total = computeTotal(props.operations, props.account.initialAmount);
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
            showDropdown: false
        };
        this.toggleDropdown = this.toggleDropdown.bind(this);
    }

    toggleDropdown(e) {
        this.setState({ showDropdown: !this.state.showDropdown });
    }

    render() {
        let active = this.props.accounts
                        .filter(account => this.props.active === account.id)
                        .map(account => (
                            <AccountActiveItem
                              key={ account.id }
                              account={ account }
                              operations={ this.props.accountOperations[account.id] }
                              handleClick={ this.toggleDropdown }
                            />
                        )
        );

        let accounts = this.props.accounts.map(account => {
            let isActive = this.props.active === account.id;
            return (
                <AccountListItem
                  key={ account.id }
                  account={ account }
                  operations={ this.props.accountOperations[account.id] }
                  active={ isActive }
                />
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
    let accounts = get.currentAccounts(state);
    let accountOperations = {};
    for (let a of accounts) {
        accountOperations[a.id] = get.operationsByAccountIds(state, a.id)
    }
    return {
        active: get.currentAccountId(state),
        accounts,
        accountOperations
    };
}, dispatch => {
    return {};
})(AccountListComponent);

export default Export;
