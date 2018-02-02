import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import AccountListItem from './account';

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
            accountsElements = this.props.access.accountIds.map(id => (
                <AccountListItem
                    key={id}
                    accountId={id}
                    location={this.props.location}
                    currentAccountId={this.props.currentAccountId}
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
                        <span className={`fa fa-${stateLabel}-square`} />
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
    let accountIds = get.accountIdsByAccessId(state, props.accessId);

    let currency = null;
    let sameCurrency = true;
    let formatCurrency;
    let total = 0;
    for (let accountId of accountIds) {
        let acc = get.accountById(state, accountId);
        if (!acc.excludeFromBalance) {
            total += acc.balance;

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
        access: get.accessById(state, props.accessId),
        total,
        totalPositive
    };
})(BankListItemComponent);

export default Export;
