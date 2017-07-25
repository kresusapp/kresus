import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';

const AccountListItem = props => {
    let { accountId, location, balance } = props;

    let color = balance >= 0 ? 'positive' : 'negative';
    let currentPathname = location.pathname;
    let currentAccountId = props.currentAccountId;
    let newPathname = currentPathname.replace(currentAccountId, accountId);

    return (
        <li
          key={ `account-details-account-list-item-${accountId}` }>
            <NavLink
              to={ newPathname }
              activeClassName="active">
                <span>
                    { props.title }
                </span>
                <span className={ `amount ${color}` }>
                    { props.formatCurrency(parseFloat(balance.toFixed(2))) }
                </span>
            </NavLink>
        </li>
    );
};

const Export = connect((state, props) => {
    let { title, formatCurrency } = get.accountById(state, props.accountId);
    let balance = get.balanceByAccountId(state, props.accountId);

    return {
        balance,
        title,
        formatCurrency
    };
})(AccountListItem);

Export.propTypes = {
    // the account's id
    accountId: PropTypes.string.isRequired,

    // the active account's id
    currentAccountId: PropTypes.string.isRequired,

    // The location object containing the current path.
    // Needed to rerender the accounts links on route change
    location: PropTypes.object.isRequired
};

export default Export;
