import React from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
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

    const accessIds = useKresusState(state => BanksStore.getAccessIds(state.banks));

    const accessItems = accessIds.map(accessId => {
        return <AccessItem key={accessId} accessId={accessId} currentViewId={currentViewId} />;
    });

    return <ul className="views-details"> {accessItems} </ul>;
};

AccessList.displayName = 'AccessList';

export default AccessList;
