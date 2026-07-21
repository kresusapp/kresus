import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import * as ViewStore from '../../store/views';
import { displayLabel, translate as $t, currency } from '../../helpers';
import URL from '../../urls';
import { DriverAccount } from '../drivers/account';

import ColoredAmount from '../ui/colored-amount';
import DisplayIf from '../ui/display-if';
import { DriverType, DriverContext } from '../drivers';

interface AccountItemProps {
    // The account unique id.
    accountId: number;
}

const AccountItem = (props: AccountItemProps) => {
    const { accountId } = props;

    const account = useKresusState(state => {
        if (!BanksStore.accountExists(state.banks, accountId)) {
            // Zombie child problem: the account has been deleted, this redux
            // listener is being called with a stale accountId. Abort early.
            return null;
        }
        return BanksStore.accountById(state.banks, accountId);
    });
    const view = useKresusState(state => {
        if (!account) {
            return null;
        }

        return ViewStore.fromAccountId(state.views, account.id);
    });

    const { pathname } = useLocation();
    const currentDriver = useContext(DriverContext);

    if (account === null || view === null) {
        // Zombie child: return nothing.
        return null;
    }

    const { balance, outstandingSum } = account;
    const formatCurrency = currency.makeFormat(account.currency);

    // Keep the user on the same sub-page (reports/charts/…) when switching
    // accounts, by rewriting the current pathname to point at this account.
    const newPathname =
        currentDriver.type !== DriverType.None
            ? pathname
                  .replace(currentDriver.type, DriverType.Account)
                  .replace(currentDriver.value!, view.id.toString())
            : URL.reports.url(new DriverAccount(view.id));

    return (
        <li key={`account-details-account-list-item-${accountId}`}>
            <NavLink to={newPathname}>
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
