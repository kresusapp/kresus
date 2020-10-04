import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';

import Access from './access';
import { OverallTotalBalance } from '../ui/accumulated-balances';

import './dashboard.css';

const Dashboard = connect(state => ({
    accessIds: get.accessIds(state),
}))(props => {
    const banks = props.accessIds.map(accessId => {
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
});

export default Dashboard;
