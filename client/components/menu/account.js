import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';
import { displayLabel } from '../../helpers';

import ColoredAmount from './colored-amount';

const AccountListItem = connect((state, props) => {
    let account = get.accountById(state, props.accountId);
    return { account };
})(props => {
    let { account, accountId } = props;
    let { balance, formatCurrency } = account;
    let newPathname = props.location.pathname.replace(props.currentAccountId, accountId);

    return (
        <li key={`account-details-account-list-item-${accountId}`}>
            <NavLink to={newPathname} activeClassName="active">
                <span>{displayLabel(account)}</span>
                &ensp;
                <ColoredAmount amount={balance} formatCurrency={formatCurrency} />
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
