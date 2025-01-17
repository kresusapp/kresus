import React from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import * as ViewStore from '../../store/views';
import { assert } from '../../helpers';
import { Driver, DriverType } from '../drivers';

import AccessItem from './access';

import './banks.css';

const AccessList = (props: { driver: Driver }) => {
    let currentViewId: number | null;
    if (props.driver.type === DriverType.Account) {
        // This is tied to an account view: parse the view number.
        assert(props.driver.value !== null, 'must have set a view value');
        currentViewId = Number.parseInt(props.driver.value, 10);
    } else {
        // A view not tied to an account, or no view.
        currentViewId = null;
    }

    const currentAccessId = useKresusState(state => {
        if (currentViewId === null) {
            return null;
        }

        const view = ViewStore.fromId(state.views, currentViewId);
        if (!view || view.accounts.length !== 1) {
            return null;
        }

        return BanksStore.accessByAccountId(state.banks, view.accounts[0]).id;
    });

    const accessIds = useKresusState(state => BanksStore.getAccessIds(state.banks));

    const accessItems = accessIds.map(accessId => {
        const isActive = currentAccessId === accessId;
        return <AccessItem key={accessId} accessId={accessId} active={isActive} />;
    });

    return <ul className="bank-details"> {accessItems} </ul>;
};

AccessList.displayName = 'AccessList';

export default AccessList;
