import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, useParams, useLocation } from 'react-router-dom';

import { get } from '../../store';
import { translate as $t } from '../../helpers';
import URL from '../../urls';
import { drivers } from '../drivers';
import { DriverCurrency } from '../drivers/currency';

import ColoredAmount from './colored-amount';
import './accumulated-balances.css';

const AccumulatedBalances = props => {
    let totalEntries = Object.entries(props.totals);
    let totalElement;

    let { pathname } = useLocation();
    let { driver = null, value: driverValue } = useParams();

    if (totalEntries.length) {
        totalElement = totalEntries
            .map(
                /**
                 * @returns {React.ReactNode}
                 */
                ([key, value]) => {
                    if (props.isCurrencyLink) {
                        /* eslint-disable prettier/prettier */
                        const newPathName =
                            driver !== null
                                ? pathname
                                    .replace(driver, drivers.CURRENCY)
                                    .replace(driverValue, key)
                                : URL.reports.url(new DriverCurrency(key));
                        return (
                            <div className="total-balance-item" key={`item-${key}`}>
                                <NavLink to={newPathName} key={`link-report-${key}`}>
                                    <ColoredAmount
                                        key={key}
                                        amount={value.total}
                                        formatCurrency={value.formatCurrency}
                                    />
                                </NavLink>
                            </div>
                        );
                    }
                    return (
                        <ColoredAmount
                            key={key}
                            amount={value.total}
                            formatCurrency={value.formatCurrency}
                        />
                    );
                }
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

    // Activate links on currencies
    isCurrencyLink: PropTypes.bool,
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

    // Activate links on currencies
    isCurrencyLink: PropTypes.bool,
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
