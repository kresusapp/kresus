import React, { useCallback } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { get, actions } from '../../store';
import { displayLabel, translate as $t, useKresusState } from '../../helpers';
import URL from '../../urls';
import { DriverAccount } from '../drivers/account';

import ColoredAmount from '../ui/colored-amount';
import DisplayIf from '../ui/display-if';
import { DriverType } from '../drivers';

interface AccountItemProps {
    // The account unique id.
    accountId: number;
}

const AccountItem = (props: AccountItemProps) => {
    const { accountId } = props;

    const account = useKresusState(state => {
        if (!get.accountExists(state, accountId)) {
            // Zombie child problem: the account has been deleted, this redux
            // listener is being called with a stale accountId. Abort early.
            return null;
        }
        return get.accountById(state, accountId);
    });
    const isSmallScreen = useKresusState(state => get.isSmallScreen(state));

    const dispatch = useDispatch();

    const hideMenu = useCallback(() => {
        actions.toggleMenu(dispatch, true);
    }, [dispatch]);

    const { pathname } = useLocation();
    const { driver = null, value } = useParams<{ driver?: string; value: string }>();

    if (account === null) {
        // Zombie child: return nothing.
        return null;
    }

    const { balance, outstandingSum, formatCurrency } = account;

    const newPathname =
        driver !== null
            ? pathname.replace(driver, DriverType.Account).replace(value, accountId.toString())
            : URL.reports.url(new DriverAccount(accountId));

    const handleHideMenu = isSmallScreen ? hideMenu : undefined;

    return (
        <li key={`account-details-account-list-item-${accountId}`} onClick={handleHideMenu}>
            <NavLink to={newPathname} activeClassName="active">
                <span>{displayLabel(account)}</span>
                &ensp;
                <ColoredAmount amount={balance} formatCurrency={formatCurrency} />
                <DisplayIf condition={outstandingSum !== 0}>
                    &ensp;
                    {`(${$t('client.menu.outstanding_sum')}: `}
                    <ColoredAmount amount={outstandingSum} formatCurrency={formatCurrency} />
                    {')'}
                </DisplayIf>
            </NavLink>
        </li>
    );
};

AccountItem.displayName = 'AccountItem';

export default AccountItem;
