import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';

import Access from './access';
import TotalBalance from '../menu/total-balance';

const Dashboard = connect(state => ({
    accessIds: get.accessIds(state),
}))(props => {
    const banks = props.accessIds.map(accessId => {
        return <Access key={accessId} accessId={accessId} />;
    });

    return (
        <div id="dashboard">
            <TotalBalance />
            <ul className="accesses-list">{banks}</ul>
        </div>
    );
});

export default Dashboard;
