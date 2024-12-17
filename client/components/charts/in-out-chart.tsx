import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';

import { useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';
import * as BanksStore from '../../store/banks';
import {
    getWellsColors,
    assert,
    translate as $t,
    round2,
    INTERNAL_TRANSFER_TYPE,
    getFontColor,
} from '../../helpers';
import { DEFAULT_CHART_FREQUENCY } from '../../../shared/settings';

import DisplayIf from '../ui/display-if';
import DiscoveryMessage from '../ui/discovery-message';

import FrequencySelect from './frequency-select';
import CurrencySelect from './currency-select';
import { Transaction } from '../../models';
import { DateRange, Form, PredefinedDateRanges } from '../ui';
import { initializeCharts } from '.';
import { DriverContext } from '../drivers';

initializeCharts();

const CHART_SIZE = 600;

function dateToMonthlyKey(d: Date) {
    return `${d.getFullYear()} - ${d.getMonth()}`;
}

function formatLabelMonthly(date: Date) {
    // Undefined means the default locale
    let defaultLocale;
    return date.toLocaleDateString(defaultLocale, {
        year: '2-digit',
        month: 'short',
    });
}

function formatLabelYearly(date: Date) {
    return `${date.getFullYear()}`;
}

function createChartPositiveNegative(
    chartId: string,
    frequency: string,
    transactions: Transaction[],
    fromDate?: Date,
    toDate?: Date
) {
    let dateKey: (d: Date) => string;
    let decrement: (d: Date) => Date;
    let formatLabel;
    switch (frequency) {
        case 'monthly':
            dateKey = dateToMonthlyKey;
            formatLabel = formatLabelMonthly;
            decrement = (d: Date) => {
                const newDate = new Date(d);
                newDate.setMonth(newDate.getMonth() - 1);
                return newDate;
            };
            break;
        case 'yearly':
            dateKey = formatLabelYearly;
            formatLabel = formatLabelYearly;
            decrement = (d: Date) => {
                const newDate = new Date(d);
                newDate.setFullYear(newDate.getFullYear() - 1);
                return newDate;
            };
            break;
        default:
            assert(false, `unexpected frequency [${frequency}]`);
    }

    const transactionToKey = (tr: Transaction) => dateKey(tr.budgetDate || tr.date);

    const POS = 0,
        NEG = 1,
        BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    const map = new Map<string, [number, number, number]>();
    // Datekey -> Date
    const dateSet = new Map();
    for (let i = 0; i < transactions.length; i++) {
        const op = transactions[i];
        const dk = transactionToKey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        const triplet = map.get(dk);
        assert(typeof triplet !== 'undefined', 'just created');

        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateSet.set(dk, +(op.budgetDate || op.date));
    }

    // Sort date in ascending order: push all pairs of (transactionToKey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    const ascDates = Array.from(dateSet);
    ascDates.sort((a, b) => a[1] - b[1]);

    // Create one tick per month/year (depending on frequency) even it there
    // are no values.
    let currentDate = toDate;
    let stopDate = fromDate;

    const now = new Date();

    if (!stopDate) {
        if (ascDates.length) {
            stopDate = new Date(ascDates[0][1]);
        } else {
            stopDate = now;
        }
    }

    if (!currentDate) {
        if (ascDates.length) {
            currentDate = new Date(ascDates[ascDates.length - 1][1]);
        } else {
            currentDate = now;
        }
    }

    // Set the date at the middle of the month to avoid issues
    // with different numbers of days in a month.
    currentDate.setDate(15);
    stopDate.setDate(15);

    // Push ticks; since we go from the most recent date to the oldest date, ticks will be pushed
    // in the opposite order.
    const descTicks: Date[] = [];
    while (currentDate >= stopDate) {
        descTicks.push(currentDate);
        currentDate = decrement(currentDate);
        currentDate.setDate(15);
    }

    // Now put ticks back in order.
    const ascTicks = descTicks.reverse();

    function makeDataset(name: string, mapIndex: number, color: string) {
        const data = [];
        for (const tickDate of ascTicks) {
            const entry = map.get(dateKey(tickDate));
            data.push(entry ? round2(entry[mapIndex]) : null);
        }

        return {
            label: name,
            data,
            backgroundColor: color,
        };
    }

    const wellsColors = getWellsColors();

    const datasets = [
        makeDataset($t('client.charts.received'), POS, wellsColors.RECEIVED),
        makeDataset($t('client.charts.spent'), NEG, wellsColors.SPENT),
        makeDataset($t('client.charts.saved'), BAL, wellsColors.SAVED),
    ];

    const labels = ascTicks.map(formatLabel);

    return new Chart(chartId, {
        type: 'bar',

        data: {
            labels,
            datasets,
        },

        // Respect the style as we're setting it.
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

interface BarChartDateProps {
    fromDate?: Date;
    toDate?: Date;
}

const BarChart = (
    props: {
        chartId: string;
        frequency: string;
        chartSize: number;
        transactions: Transaction[];
    } & BarChartDateProps
) => {
    const container = useRef<Chart>();

    const redraw = useCallback(() => {
        container.current = createChartPositiveNegative(
            props.chartId,
            props.frequency,
            props.transactions,
            props.fromDate,
            props.toDate
        );
    }, [props]);

    useEffect(() => {
        redraw();
        return () => {
            if (container.current) {
                container.current.destroy();
            }
        };
    }, [redraw]);

    const style = {
        height: `${props.chartSize}px`,
        width: '100%',
    };

    return (
        <div style={style}>
            <canvas id={props.chartId} />
        </div>
    );
};

function makeDateFilter(fromDate: Date | undefined, toDate: Date | undefined) {
    let dateFilter: (date: Date) => boolean;
    if (fromDate && toDate) {
        dateFilter = d => d >= fromDate && d <= toDate;
    } else if (fromDate) {
        dateFilter = d => d >= fromDate;
    } else if (toDate) {
        dateFilter = d => d <= toDate;
    } else {
        dateFilter = () => true;
    }
    return dateFilter;
}

const InOutChart = () => {
    const driver = useContext(DriverContext);

    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    const selectDateRange = useCallback(
        (dates: [Date, Date?] | null) => {
            if (dates === null) {
                setFromDate(undefined);
                setToDate(undefined);
            } else {
                setFromDate(dates[0]);
                if (typeof dates[1] !== 'undefined') {
                    setToDate(dates[1]);
                }
            }
        },
        [setFromDate, setToDate]
    );

    const setDateRange = useCallback(
        (dates: [Date, Date]) => {
            setFromDate(dates[0]);
            setToDate(dates[1]);
        },
        [setFromDate, setToDate]
    );

    let dateRangeValue: [Date] | [Date, Date] | undefined;
    if (typeof fromDate !== 'undefined') {
        if (typeof toDate !== 'undefined') {
            dateRangeValue = [fromDate, toDate];
        } else {
            dateRangeValue = [fromDate];
        }
    }

    const defaultFrequency = useKresusState(state =>
        SettingsStore.get(state.settings, DEFAULT_CHART_FREQUENCY)
    );
    assert(
        defaultFrequency === 'monthly' || defaultFrequency === 'yearly',
        'known default frequency'
    );
    const [currentFrequency, setFrequency] = useState<'monthly' | 'yearly'>(defaultFrequency);

    const predefinedRanges =
        currentFrequency === 'monthly' ? (
            <PredefinedDateRanges
                onChange={setDateRange}
                includeYears={true}
                includeMonths={true}
            />
        ) : (
            <PredefinedDateRanges onChange={setDateRange} includeYears={true} />
        );

    const driverTransactions = useKresusState(state => driver.getTransactions(state.banks));
    const dateFilter = makeDateFilter(fromDate, toDate);

    // Filter out transactions which are internal transfers and those outside the request period.
    const filteredTransactions = driverTransactions.filter(
        t => t.type !== INTERNAL_TRANSFER_TYPE.name && dateFilter(t.budgetDate || t.date)
    );

    // Map the transactions to their currency, getting the information through the account.
    const currencyToTransactions = useKresusState(state => {
        const map = new Map<string, Transaction[]>();
        for (const tr of filteredTransactions) {
            const account = BanksStore.accountById(state.banks, tr.accountId);
            const currency = account.currency;
            if (!map.has(currency)) {
                map.set(currency, []);
            }
            const entry = map.get(currency);
            assert(typeof entry !== 'undefined', 'just created');
            entry.push(tr);
        }
        return map;
    });

    // Add one chart per currency. Display the currency name if there's at least two charts to
    // display.
    const charts = [];
    for (const [currency, transactions] of currencyToTransactions) {
        charts.push(
            <div key={currency}>
                <DisplayIf condition={currencyToTransactions.size > 1}>
                    <h3>
                        {currency} {$t('client.charts.currency_no_conversion')}
                    </h3>
                </DisplayIf>

                <BarChart
                    chartId={`inoutchart-${currency}`}
                    transactions={transactions}
                    chartSize={CHART_SIZE}
                    frequency={currentFrequency}
                    fromDate={fromDate}
                    toDate={toDate}
                />
            </div>
        );
    }

    return (
        <>
            <DiscoveryMessage message={$t('client.charts.differences_desc')} />

            <Form center={true}>
                <Form.Input label={$t('client.charts.frequency')} id="frequency">
                    <FrequencySelect
                        value={currentFrequency}
                        onChange={setFrequency}
                        id="frequency"
                    />
                </Form.Input>

                <Form.Input label={$t('client.charts.period')} id="period" sub={predefinedRanges}>
                    <DateRange id="period" onSelect={selectDateRange} value={dateRangeValue} />
                </Form.Input>
            </Form>

            <hr />

            {charts}
        </>
    );
};

export default InOutChart;

interface DashboardInOutChartProps {
    accessId: number;
    chartSize: number;
    fromDate: Date;
    toDate: Date;
}

export const DashboardInOutChart = (props: DashboardInOutChartProps) => {
    const dateFilter = makeDateFilter(props.fromDate, props.toDate);

    const currencyToTransactions = useKresusState(state => {
        const currentAccountIds = BanksStore.accountIdsByAccessId(state.banks, props.accessId);

        const ret = new Map<string, Transaction[]>();
        for (const accId of currentAccountIds) {
            const account = BanksStore.accountById(state.banks, accId);
            if (account.excludeFromBalance) {
                continue;
            }

            const currency = account.currency;
            if (!ret.has(currency)) {
                ret.set(currency, []);
            }
            const transactions = BanksStore.transactionsByAccountId(state.banks, accId).filter(
                t => t.type !== INTERNAL_TRANSFER_TYPE.name && dateFilter(t.budgetDate || t.date)
            );
            const entry = ret.get(currency);
            assert(typeof entry !== 'undefined', 'just created');
            entry.push(...transactions);
        }
        return ret;
    });

    const initialCurrency = currencyToTransactions.keys().next().value;
    const [currentCurrency, setCurrency] = useState(initialCurrency);

    // Second check is here for TypeScript.
    if (typeof initialCurrency === 'undefined' || typeof currentCurrency === 'undefined') {
        // No currency means no transactions, so just bail out.
        return null;
    }

    const chartIdPrefix = `barchart-${props.accessId}`;

    Chart.defaults.color = getFontColor();

    const transactions = currencyToTransactions.get(currentCurrency);
    assert(typeof transactions !== 'undefined', 'known transactions');

    return (
        <>
            <DisplayIf condition={currencyToTransactions.size > 1}>
                <p>
                    <CurrencySelect
                        allowMultiple={false}
                        value={currentCurrency}
                        currencies={Array.from(currencyToTransactions.keys())}
                        onChange={setCurrency}
                    />
                </p>
            </DisplayIf>

            <div>
                <BarChart
                    chartId={`${chartIdPrefix}-${currentCurrency}`}
                    transactions={transactions}
                    chartSize={props.chartSize}
                    frequency="monthly"
                />
            </div>
        </>
    );
};
