import React from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { displayLabel, FETCH_STATUS_SUCCESS } from '../../helpers';
import { fetchStatusToLabel } from '../../errors';

import DisplayIf from '../ui/display-if';
import AccountListItem from '../menu/account';
import { AccessTotalBalance } from '../ui/accumulated-balances';
import { DashboardInOutChart } from '../charts/in-out-chart';

const Access = (props: { accessId: number }) => {
    const access = useKresusState(state => BanksStore.accessById(state.banks, props.accessId));

    const accountsElements = access.accountIds.map(id => (
        <AccountListItem key={id} accountId={id} />
    ));

    const { fetchStatus, isBankVendorDeprecated, enabled } = access;

    const statusLabel =
        fetchStatus !== FETCH_STATUS_SUCCESS ? fetchStatusToLabel(fetchStatus) : null;

    // Display only the current month.
    const fromDate = new Date();
    fromDate.setDate(0);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 1);
    toDate.setDate(-1);
    toDate.setHours(23, 59, 59, 999);

    return (
        <li className="dashboard-access">
            <div className="dashboard-access-summary">
                <span className={`icon icon-${access.vendorId}`} />
                <div className="bank-summary">
                    <h3>{displayLabel(access)}</h3>
                    <AccessTotalBalance accessId={props.accessId} className="bank-sum" />
                </div>
            </div>

            <DisplayIf
                condition={
                    !isBankVendorDeprecated && enabled && fetchStatus !== FETCH_STATUS_SUCCESS
                }>
                <p className="alerts warning">
                    <span className="fa fa-exclamation-triangle status fail" />
                    {statusLabel}
                </p>
            </DisplayIf>

            <div className="details">
                <ul className={'accounts'}>{accountsElements}</ul>

                <div className="dashboard-access-charts">
                    <DashboardInOutChart
                        accessId={props.accessId}
                        chartSize={250}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                </div>
            </div>
        </li>
    );
};

Access.displayName = 'DashboardAccess';

export default Access;
