import React, { useCallback, useState } from 'react';

import { get } from '../../store';
import { displayLabel, FETCH_STATUS_SUCCESS, useKresusState } from '../../helpers';
import { fetchStatusToLabel } from '../../errors';

import AccountItem from './account';

import { AccessTotalBalance } from '../ui/accumulated-balances';
import DisplayIf from '../ui/display-if';

interface AccessItemProps {
    // The access identifier.
    accessId: number;

    // Whether the bank is the current bank selected.
    active: boolean;
}

const AccessItem = (props: AccessItemProps) => {
    const [showAccounts, setShowAccounts] = useState(props.active);

    const access = useKresusState(state => {
        if (!get.accessExists(state, props.accessId)) {
            // Zombie child: ignore.
            return null;
        }
        return get.accessById(state, props.accessId);
    });

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
        <li
            key={`bank-details bank-list-item-${access.id}`}
            className={props.active ? 'active' : ''}>
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
            <ul className={'accounts'}>{accountsElements}</ul>
        </li>
    );
};

AccessItem.displayName = 'AccessItem';

export default AccessItem;
