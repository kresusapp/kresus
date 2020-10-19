import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get } from '../../store';
import { translate as $t } from '../../helpers';

import ColoredAmount from './colored-amount';

const AccumulatedBalances = props => {
    let totalEntries = Object.entries(props.totals);
    let totalElement;
    if (totalEntries.length) {
        totalElement = totalEntries
            .map(
                /**
                 * @returns {React.ReactNode}
                 */
                ([key, value]) => (
                    <ColoredAmount
                        key={key}
                        amount={value.total}
                        formatCurrency={value.formatCurrency}
                    />
                )
            )
            .reduce((prev, curr) => [prev, ' | ', curr]);
    } else {
        totalElement = 'N/A';
    }
    return (
        <p className={props.className}>
            <span>{props.label}</span>
            &ensp;
            {totalElement}
        </p>
    );
};

AccumulatedBalances.propTypes = {
    // An object containing the totals to be displayed.
    totals: PropTypes.objectOf(
        PropTypes.shape({
            total: PropTypes.number.isRequired,
            formatCurrency: PropTypes.func.isRequired,
        })
    ).isRequired,

    // The label to describe the list of balances.
    label: PropTypes.string.isRequired,

    // The class to be applied to the wrapping component.
    className: PropTypes.string,
};

export const OverallTotalBalance = connect(state => {
    let accessIds = get.accessIds(state);
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
    return {
        totals,
        label: $t('client.menu.overall_balance'),
    };
})(AccumulatedBalances);

OverallTotalBalance.propTypes = {
    // The class to be applied to the wrapping component.
    className: PropTypes.string,
};

export const AccessTotalBalance = connect((state, props) => {
    return {
        totals: get.accessTotal(state, props.accessId),
        label: $t('client.menu.total'),
    };
})(AccumulatedBalances);

AccessTotalBalance.propTypes = {
    // The unique identifier of the access for which we want to display the balances.
    accessId: PropTypes.number.isRequired,

    // The class to be applied to the wrapping component.
    className: PropTypes.string,
};
