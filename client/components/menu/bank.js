import React from 'react';
import { connect } from 'react-redux';

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
        let stateLabel = this.state.showAccounts ? 'minus' : 'plus';
        let maybeActive = this.props.active ? 'active' : '';
        let accounts = this.props.getAccounts(this.props.access.id);
        let accountsBalances = {};
        let total = 0;
        let currentCurrency = '';
        let sameCurrency = true;
        let formatCurrency;

        for (let acc of accounts) {
            let balance = computeTotal(this.props.getAccountOperations(acc.id), acc.initialAmount);
            accountsBalances[acc.id] = balance;
            total += balance;

            if (currentCurrency && (currentCurrency !== acc.currency))
                sameCurrency = false;

            currentCurrency = acc.currency;
            formatCurrency = acc.formatCurrency;
        }

        let color = total >= 0 ? 'positive' : 'negative';
        let sumup;

        if (sameCurrency) {
            sumup = (
                <span className={ `amount ${color}` }>
                    { formatCurrency(total) }
                </span>
            );
        } else {
            sumup = (
                <span title={ $t('client.menu.different_currencies') }>N/A</span>
            );
        }

        let accountsElements = [];

        if (this.state.showAccounts) {
            for (let acc of accounts) {
                accountsElements.push((
                    <AccountListItem
                      key={ acc.id }
                      account={ acc }
                      balance={ accountsBalances[acc.id] }
                      active={ this.props.activeAccountId === acc.id }
                    />
                ));
            }
        }

        return (
            <li key={ `bank-details bank-list-item-${this.props.access.id}` }
              className={ maybeActive }>
                <div className={ `icon icon-${this.props.access.uuid}` }></div>
                <div className="bank-name">
                    <a href="#" onClick={ this.handleClick }>
                        <span>{ this.props.access.name }</span>
                        <span className={ `bank-details-toggle fa fa-${stateLabel}-square` }></span>
                    </a>
                    <a href="#" className="bank-sum">
                        <span>Total</span>
                        { sumup }
                    </a>
                </div>
                <ul className={ `accounts` }>
                    { accountsElements }
                </ul>
            </li>
        );
    }
}

BankListItemComponent.propTypes = {
    // the bank object
    access: React.PropTypes.object.isRequired,

    // Whether the bank is the current bank selected
    active: React.PropTypes.bool
};

const Export = connect(state => {
    let getAccounts = bankId => get.accountsByAccessId(state, bankId);
    let getAccountOperations = accountId => get.operationsByAccountIds(state, accountId);

    return {
        getAccounts,
        getAccountOperations,
        activeAccountId: get.currentAccountId(state)
    };
}, null)(BankListItemComponent);

export default Export;
