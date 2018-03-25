import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import AccountListItem from './account';

function computeTotal(operations, initial) {
    let total = operations.reduce((a, b) => a + b.amount, initial);
    return Math.round(total * 100) / 100;
}

class BankListItemComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAccounts: this.props.active
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            showAccounts: !this.state.showAccounts
        });
    }

    render() {
        let total = this.props.total;

        let totalElement;
        if (total !== null) {
            let color = this.props.totalPositive ? 'positive' : 'negative';
            totalElement = <span className={`amount ${color}`}>{total}</span>;
        } else {
            totalElement = <span title={$t('client.menu.different_currencies')}>N/A</span>;
        }

        let accountsElements;
        if (this.state.showAccounts) {
            accountsElements = this.props.accounts.map(acc => (
                <AccountListItem
                    key={acc.id}
                    account={acc}
                    location={this.props.location}
                    currentAccountId={this.props.currentAccountId}
                    balance={this.props.accountsBalances.get(acc.id)}
                />
            ));
        }

        let stateLabel = this.state.showAccounts ? 'minus' : 'plus';

        return (
            <li
                key={`bank-details bank-list-item-${this.props.access.id}`}
                className={this.props.active ? 'active' : ''}>
                <div className={`icon icon-${this.props.access.bank}`} />
                <div className="bank-name">
                    <div className="clickable" onClick={this.handleClick}>
                        <span>{this.props.access.name}</span>
                        <span className={`bank-details-toggle fa fa-${stateLabel}-square`} />
                    </div>
                    <p className="bank-sum">
                        <span>Total</span>
                        {totalElement}
                    </p>
                </div>
                <ul className={'accounts'}>{accountsElements}</ul>
            </li>
        );
    }
}

BankListItemComponent.propTypes = {
    // the bank object
    access: PropTypes.object.isRequired,

    // Whether the bank is the current bank selected
    active: PropTypes.bool.isRequired,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: PropTypes.object.isRequired
};

const Export = connect((state, props) => {
    let accounts = get.accountsByAccessId(state, props.access.id);

    let accountsBalances = new Map();
    let currency = null;
    let sameCurrency = true;
    let formatCurrency;
    let total = 0;
    for (let acc of accounts) {
        let balance = computeTotal(get.operationsByAccountIds(state, acc.id), acc.initialAmount);
        accountsBalances.set(acc.id, balance);
        if (!acc.excludeFromBalance) {
            total += balance;

            if (sameCurrency) {
                sameCurrency = !currency || currency === acc.currency;
            }

            currency = currency || acc.currency;
            formatCurrency = formatCurrency || acc.formatCurrency;
        }
    }

    let totalPositive = true;
    if (sameCurrency && formatCurrency) {
        totalPositive = total >= 0;
        total = formatCurrency(parseFloat(total.toFixed(2)));
    } else {
        total = null;
    }

    return {
        accounts,
        accountsBalances,
        total,
        totalPositive
    };
})(BankListItemComponent);

export default Export;
