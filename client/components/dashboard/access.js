import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../../store';
import { displayLabel, FETCH_STATUS_SUCCESS, translate as $t } from '../../helpers';
import { fetchStatusToLabel } from '../../errors';

import DisplayIf from '../ui/display-if';
import AccountListItem from '../menu/account';
import ColoredAmount from '../menu/colored-amount';
import InOutChart from '../charts/in-out-chart';

const Access = props => {
    let { totals, access } = props;
    let totalEntries = Object.entries(totals);
    let totalElement;
    if (totalEntries.length) {
        totalElement = totalEntries
            .map(([key, value]) => (
                <ColoredAmount
                    key={key}
                    amount={value.total}
                    formatCurrency={value.formatCurrency}
                />
            ))
            .reduce((prev, curr) => [prev, ' | ', curr]);
    } else {
        totalElement = 'N/A';
    }

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
                    <p className="bank-sum">
                        <span>{$t('client.menu.total')}</span>
                        &ensp;
                        {totalElement}
                    </p>
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
                    <InOutChart
                        accessId={props.access.id}
                        chartSize={250}
                        subchartSize={0}
                        allowMultipleCurrenciesDisplay={false}
                        theme={props.theme}
                        fromDate={fromDate}
                        toDate={toDate}
                        hideDiscoveryMessages={true}
                    />
                </div>
            </div>
        </li>
    );
};

Access.propTypes = {
    // The bank object.
    access: PropTypes.object.isRequired,

    // A literal map with the currency code as key and the balance & currency format as value.
    totals: PropTypes.object.isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,
};

const Export = connect((state, props) => {
    let accountIds = get.accountIdsByAccessId(state, props.accessId);

    let totals = {};
    for (let accountId of accountIds) {
        let acc = get.accountById(state, accountId);
        if (!acc.excludeFromBalance && acc.currency) {
            if (!(acc.currency in totals)) {
                totals[acc.currency] = { total: acc.balance, formatCurrency: acc.formatCurrency };
            } else {
                totals[acc.currency].total += acc.balance;
            }
        }
    }

    const theme = get.boolSetting(state, 'dark-mode') ? 'dark' : 'light';

    return {
        access: get.accessById(state, props.accessId),
        totals,
        theme,
    };
})(Access);

export default Export;
