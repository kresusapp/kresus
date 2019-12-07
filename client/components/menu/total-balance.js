import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import ColoredAmount from './colored-amount';

let TotalBalanceComponent = props => {
    let totalEntries = Object.entries(props.totals);
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

    return (
        <p className="bank-details bank-total-accesses">
            <span>{$t('client.menu.overall_balance')}</span>
            &ensp;
            {totalElement}
        </p>
    );
};

const computeTotalBalance = (state, accessIds) => {
    let totals = {};
    for (let accessId of accessIds) {
        let accessTotal = get.accessTotal(state, accessId);
        for (let currency in accessTotal) {
            if (!(currency in totals)) {
                totals[currency] = accessTotal[currency];
            } else {
                totals[currency].total += accessTotal[currency].total;
            }
        }
    }
    return totals;
};

const TotalBalance = connect(state => {
    let accessIds = get.accessIds(state);
    let totals = computeTotalBalance(state, accessIds);
    return {
        totals
    };
})(TotalBalanceComponent);

export default TotalBalance;
