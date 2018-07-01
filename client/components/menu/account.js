import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';

const AccountListItem = connect((state, props) => {
    let account = get.accountById(state, props.accountId);
    return { account };
})(props => {
    let { account, accountId } = props;
    let { balance } = account;

    let color = balance >= 0 ? 'positive' : 'negative';
    let accountBalance = account.formatCurrency(parseFloat(balance.toFixed(2)));
    let newPathname = props.location.pathname.replace(props.currentAccountId, accountId);

    return (
        <li key={`account-details-account-list-item-${accountId}`}>
            <NavLink to={newPathname} activeClassName="active">
                <span>{account.title}</span>
                <span className={`amount ${color}`}>{accountBalance}</span>
            </NavLink>
        </li>
    );
});

AccountListItem.propTypes = {
    // the account unique id.
    accountId: PropTypes.string.isRequired,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: PropTypes.object.isRequired
};

export default AccountListItem;
