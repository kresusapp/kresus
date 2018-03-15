import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const AccountListItem = props => {
    let { account, location } = props;
    let total = props.balance;
    let color = total >= 0 ? 'positive' : 'negative';
    let currentPathname = location.pathname;
    let currentAccountId = props.currentAccountId;
    let newPathname = currentPathname.replace(currentAccountId, account.id);

    return (
        <li key={`account-details-account-list-item-${account.id}`}>
            <NavLink to={newPathname} activeClassName="active">
                <span>{account.customLabel || account.title}</span>
                <span className={`amount ${color}`}>
                    {account.formatCurrency(parseFloat(total.toFixed(2)))}
                </span>
            </NavLink>
        </li>
    );
};

AccountListItem.propTypes = {
    // the account object
    account: PropTypes.object.isRequired,

    // the account balance
    balance: PropTypes.number,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: PropTypes.object.isRequired
};

export default AccountListItem;
