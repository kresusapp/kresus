import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';

const AccountListItem = connect((state, props) => {
    return get.accountById(state, props.accountId);
})(props => {
    let { balance, title, location, formatCurrency, currentAccountId, accountId } = props;
    let color = balance >= 0 ? 'positive' : 'negative';
    let currentPathname = location.pathname;
    let newPathname = currentPathname.replace(currentAccountId, accountId);

    return (
        <li key={`account-details-account-list-item-${accountId}`}>
            <NavLink to={newPathname} activeClassName="active">
                <span>{title}</span>
                <span className={`amount ${color}`}>
                    {formatCurrency(parseFloat(balance.toFixed(2)))}
                </span>
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
