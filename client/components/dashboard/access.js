import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { displayLabel, FETCH_STATUS_SUCCESS } from '../../helpers';
import { fetchStatusToLabel } from '../../errors';
import { DARK_MODE } from '../../../shared/settings';

import DisplayIf from '../ui/display-if';
import AccountListItem from '../menu/account';
import { AccessTotalBalance } from '../ui/accumulated-balances';
import { DashboardInOutChart } from '../charts/in-out-chart';

const Access = props => {
    let { access } = props;

    let accountsElements = access.accountIds.map(id => <AccountListItem key={id} accountId={id} />);

    let { fetchStatus, isBankVendorDeprecated, enabled } = access;

    let statusLabel = fetchStatus !== FETCH_STATUS_SUCCESS ? fetchStatusToLabel(fetchStatus) : null;

    // Display only the current month.
    let fromDate = new Date();
    fromDate.setDate(0);
    fromDate.setHours(0, 0, 0, 0);

    let toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 1);
    toDate.setDate(-1);
    fromDate.setHours(23, 59, 59, 999);

    return (
        <li className="dashboard-access">
            <div className="dashboard-access-summary">
                <span className={`icon icon-${props.access.vendorId}`} />
                <div className="bank-summary">
                    <h3>{displayLabel(props.access)}</h3>
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
                        accessId={props.access.id}
                        chartSize={250}
                        subchartSize={0}
                        theme={props.theme}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                </div>
            </div>
        </li>
    );
};

Access.propTypes = {
    // The bank object.
    access: PropTypes.object.isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,
};

const Export = connect((state, props) => {
    const theme = get.boolSetting(state, DARK_MODE) ? 'dark' : 'light';

    return {
        access: get.accessById(state, props.accessId),
        theme,
    };
})(Access);

export default Export;
