import React, { useCallback, useState } from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import * as ViewStore from '../../store/views';
import { displayLabel, FETCH_STATUS_SUCCESS } from '../../helpers';
import { fetchStatusToLabel } from '../../errors';

import AccountItem from './account';

import { AccessTotalBalance } from '../ui/accumulated-balances';
import DisplayIf from '../ui/display-if';

interface AccessItemProps {
    // The access identifier.
    accessId: number;

    // The current view id.
    currentViewId: number | null;
}

const AccessItem = (props: AccessItemProps) => {
    const access = useKresusState(state => {
        if (!BanksStore.accessExists(state.banks, props.accessId)) {
            // Zombie child: ignore.
            return null;
        }
        return BanksStore.accessById(state.banks, props.accessId);
    });

    // Check whether the access contains an account which is associated to the current view.
    // If it does, display the accounts list, else hide it.
    const containsCurrentAccountView = useKresusState(state => {
        if (props.currentViewId === null || !access) {
            return null;
        }

        return access.accountIds.some(id => {
            const accountView = ViewStore.fromAccountId(state.views, id);
            return (
                accountView && !accountView.createdByUser && accountView.id === props.currentViewId
            );
        });
    });

    const [showAccounts, setShowAccounts] = useState(containsCurrentAccountView);

    const handleClick = useCallback(() => {
        setShowAccounts(!showAccounts);
    }, [setShowAccounts, showAccounts]);

    if (!access) {
        return null;
    }

    let accountsElements;
    if (showAccounts) {
        accountsElements = access.accountIds.map(id => <AccountItem key={id} accountId={id} />);
    }

    const stateLabel = showAccounts ? 'minus' : 'plus';

    const { fetchStatus, isBankVendorDeprecated, enabled } = access;

    let statusLabel;
    if (fetchStatus !== FETCH_STATUS_SUCCESS) {
        statusLabel = fetchStatusToLabel(fetchStatus);
    }

    return (
        <li key={`views-details bank-list-item-${access.id}`}>
            <div className={`icon icon-${access.vendorId}`} />
            <div className="bank-name">
                <div>
                    <DisplayIf
                        condition={
                            !isBankVendorDeprecated &&
                            enabled &&
                            fetchStatus !== FETCH_STATUS_SUCCESS
                        }>
                        <span
                            className="tooltipped tooltipped-se tooltipped-multiline
                                           tooltipped-small"
                            aria-label={statusLabel}>
                            <span className="fa fa-exclamation-triangle status fail" />
                        </span>
                    </DisplayIf>

                    <button className="btn transparent" onClick={handleClick}>
                        <span className="name">{displayLabel(access)}</span>
                        <span className={`fa fa-${stateLabel}-square`} />
                    </button>
                </div>
                <AccessTotalBalance accessId={access.id} className="bank-sum" />
            </div>
            <ul className="views-list accounts">{accountsElements}</ul>
        </li>
    );
};

AccessItem.displayName = 'AccessItem';

export default AccessItem;
