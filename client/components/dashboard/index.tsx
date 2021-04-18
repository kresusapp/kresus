import React from 'react';

import { get } from '../../store';
import { useKresusState } from '../../helpers';
import Access from './access';
import { OverallTotalBalance } from '../ui/accumulated-balances';

import './dashboard.css';

const Dashboard = () => {
    const accessIds = useKresusState(state => get.accessIds(state));

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
