import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { displayLabel, translate as $t } from '../../helpers';
import URL from '../../urls';

import ColoredAmount from './colored-amount';

const AccountListItem = connect(
    (state, props) => {
        return {
            account: get.accountById(state, props.accountId),
            isSmallScreen: get.isSmallScreen(state)
        };
    },
    dispatch => {
        return {
            hideMenu() {
                actions.toggleMenu(dispatch, true);
            }
        };
    }
)(props => {
    let { account, accountId, isSmallScreen, hideMenu, match } = props;
    let { balance, outstandingSum, formatCurrency } = account;

    let newPathname;
    switch (match.params.section) {
        case 'reports':
            newPathname = URL.reports.url(accountId);
            break;
        case 'budget':
            newPathname = URL.budgets.url(accountId);
            break;
        case 'charts':
            newPathname = URL.charts.url(match.subsection, accountId);
            break;
        case 'duplicates':
            newPathname = URL.duplicates.url(accountId);
            break;
        default:
            newPathname = URL.reports.url(accountId);
    }

    let handleHideMenu = isSmallScreen ? hideMenu : null;

    // Outstanding balance.
    let maybeOutstandingSum =
        outstandingSum !== 0 ? (
            <React.Fragment>
                &ensp;
                {`(${$t('client.menu.outstanding_balance')}`}
                <ColoredAmount amount={outstandingSum} formatCurrency={formatCurrency} />
                {')'}
            </React.Fragment>
        ) : null;

    return (
        <li key={`account-details-account-list-item-${accountId}`} onClick={handleHideMenu}>
            <NavLink to={newPathname} activeClassName="active">
                <span>{displayLabel(account)}</span>
                &ensp;
                <ColoredAmount amount={balance} formatCurrency={formatCurrency} />
                {maybeOutstandingSum}
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
