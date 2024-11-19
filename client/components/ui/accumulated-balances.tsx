import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { translate as $t } from '../../helpers';
import URL from '../../urls';
import { DriverType } from '../drivers';
import { DriverCurrency } from '../drivers/currency';

import ColoredAmount from './colored-amount';
import './accumulated-balances.css';

interface AccumulatedBalancesProps {
    // An object containing the totals to be displayed.
    totals: Record<string, BanksStore.AccessTotal>;

    // The label to describe the list of balances.
    label: string;

    // The class to be applied to the wrapping component.
    className?: string;

    // Activate links on currencies
    isCurrencyLink: boolean;
}

const AccumulatedBalances = (props: AccumulatedBalancesProps) => {
    const totalEntries = Object.entries(props.totals);

    const { pathname } = useLocation();
    const { driver = null, value: driverValue } = useParams<{
        driver?: string;
        value: string;
    }>();

    let totalElement;
    if (totalEntries.length) {
        totalElement = totalEntries
            .map(([key, value]): React.ReactNode => {
                if (props.isCurrencyLink) {
                    /* eslint-disable prettier/prettier */
                        const newPathName =
                            driver !== null
                                ? pathname
                                    .replace(driver, DriverType.Currency)
                                    .replace(driverValue, key)
                                : URL.reports.url(new DriverCurrency(key));
                        return (
                            <span className="total-balance-item" key={`item-${key}`}>
                                <NavLink to={newPathName} key={`link-report-${key}`}>
                                    <ColoredAmount
                                        key={key}
                                        amount={value.total}
                                        formatCurrency={value.formatCurrency}
                                    />
                                </NavLink>
                            </span>
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

export const OverallTotalBalance = (props: {
    // Activate links on currencies
    isCurrencyLink: boolean,
    // The class to be applied to the wrapping component.
    className?: string,
}) => {
    const accessIds = useKresusState(state => BanksStore.getAccessIds(state.banks));
    const totals = useKresusState(state => {
        const totalMap: Record<string, BanksStore.AccessTotal> = {};
        for (const accessId of accessIds) {
            if (!BanksStore.accessExists(state.banks, accessId)) {
                // Zombie child: ignore.
                continue;
            }
            const accessTotal = BanksStore.computeAccessTotal(state.banks, accessId);
            for (const currency in accessTotal) {
                if (!(currency in totalMap)) {
                    totalMap[currency] = accessTotal[currency];
                } else {
                    totalMap[currency].total += accessTotal[currency].total;
                }
            }
        }
        return totalMap;
    });

    return (<AccumulatedBalances
        totals={totals}
        label={$t('client.menu.overall_balance')}
        isCurrencyLink={props.isCurrencyLink}
        className={props.className} />);
};

export const AccessTotalBalance = (props: { accessId: number, className?: string }) => {
    const totals = useKresusState(state => {
        if (!BanksStore.accessExists(state.banks, props.accessId)) {
            return {};
        }
        return BanksStore.computeAccessTotal(state.banks, props.accessId);
    });
    return (<AccumulatedBalances
        className={props.className}
        totals={totals}
        label={$t('client.menu.total')}
        isCurrencyLink={false} />);
};
