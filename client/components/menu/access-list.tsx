import React from 'react';

import { get } from '../../store';
import { assert, useKresusState } from '../../helpers';
import { Driver, DriverType } from '../drivers';

import AccessItem from './access';

import './banks.css';

const AccessList = (props: { driver: Driver }) => {
    let currentAccountId: number | null;
    if (props.driver.type === DriverType.Account) {
        // This is a tied to an account: parse the account number.
        assert(props.driver.value !== null, 'must have set an account value');
        currentAccountId = Number.parseInt(props.driver.value, 10);
    } else {
        // A view not tied to an account, or no view.
        currentAccountId = null;
    }

    const currentAccessId = useKresusState(state => {
        if (currentAccountId === null) {
            return null;
        }
        return get.accessByAccountId(state, currentAccountId).id;
    });

    const accessIds = useKresusState(state => get.accessIds(state));

    const accessItems = accessIds.map(accessId => {
        const isActive = currentAccessId === accessId;
        return <AccessItem key={accessId} accessId={accessId} active={isActive} />;
    });

    return <ul className="bank-details"> {accessItems} </ul>;
};

AccessList.displayName = 'AccessList';

export default AccessList;
