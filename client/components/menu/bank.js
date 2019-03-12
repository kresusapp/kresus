import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { displayLabel, translate as $t } from '../../helpers';

import AccountListItem from './account';
import ColoredAmount from './colored-amount';

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
        let { total, formatCurrency } = this.props;

        let totalElement =
            total === null ? (
                <span title={$t('client.menu.different_currencies')}>N/A</span>
            ) : (
                <ColoredAmount amount={total} formatCurrency={formatCurrency} />
            );

        let accountsElements;
        if (this.state.showAccounts) {
            accountsElements = this.props.access.accountIds.map(id => (
                <AccountListItem
                    key={id}
                    accountId={id}
                    location={this.props.location}
                    match={this.props.match}
                    currentAccountId={this.props.currentAccountId}
                />
            ));
        }

        let stateLabel = this.state.showAccounts ? 'minus' : 'plus';

        return (
            <li
                key={`bank-details bank-list-item-${this.props.access.id}`}
                className={this.props.active ? 'active' : ''}>
                <div className={`icon icon-${this.props.access.vendorId}`} />
                <div className="bank-name">
                    <div className="clickable" onClick={this.handleClick}>
                        <span>{displayLabel(this.props.access)}</span>
                        <span className={`fa fa-${stateLabel}-square`} />
                    </div>
                    <p className="bank-sum">
                        <span>{$t('client.menu.total')}</span>
                        &ensp;
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

    if (!sameCurrency || !formatCurrency) {
        total = null;
    }

    return {
        access: get.accessById(state, props.accessId),
        total,
        formatCurrency
    };
})(BankListItemComponent);

export default Export;
