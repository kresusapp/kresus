import React from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import Access from './access';
import { OverallTotalBalance } from '../ui/accumulated-balances';

import './dashboard.css';

const Dashboard = () => {
    const accessIds = useKresusState(state => BanksStore.getAccessIds(state.banks));

    const banks = accessIds.map(accessId => {
        return <Access key={accessId} accessId={accessId} />;
    });

    return (
        <div id="dashboard">
            <OverallTotalBalance
                className="bank-details bank-total-accesses"
                isCurrencyLink={true}
            />
            <ul className="accesses-list">{banks}</ul>
        </div>
    );
};

Dashboard.displayName = 'Dashboard';

export default Dashboard;
