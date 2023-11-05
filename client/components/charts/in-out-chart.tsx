import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js';

import { get } from '../../store';
import {
    getWellsColors,
    useKresusState,
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
import CurrencySelect, { ALL_CURRENCIES } from './currency-select';
import { Transaction } from '../../models';
import { DateRange, Form, PredefinedDateRanges } from '../ui';
import { initializeCharts } from '.';

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
    theme: string,
    fromDate?: Date,
    toDate?: Date
) {
    let datekey: (d: Date) => string;
    let decrement: (d: Date) => Date;
    let formatLabel;
    switch (frequency) {
        case 'monthly':
            datekey = dateToMonthlyKey;
            formatLabel = formatLabelMonthly;
            decrement = (d: Date) => {
                const newDate = new Date(d);
                newDate.setMonth(newDate.getMonth() - 1);
                return newDate;
            };
            break;
        case 'yearly':
            datekey = formatLabelYearly;
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

    const transactionToKey = (tr: Transaction) => datekey(tr.budgetDate || tr.date);

    const POS = 0,
        NEG = 1,
        BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    const map = new Map<string, [number, number, number]>();
    // Datekey -> Date
    const dateset = new Map();
    for (let i = 0; i < transactions.length; i++) {
        const op = transactions[i];
        const dk = transactionToKey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        const triplet = map.get(dk);
        assert(typeof triplet !== 'undefined', 'just created');

        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +(op.budgetDate || op.date));
    }

    // Sort date in ascending order: push all pairs of (transactionToKey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    const dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    // Create one tick per month/year (depending on frequency) even it there
    // are no values.
    let currentDate = toDate;
    let stopDate = fromDate;

    const now = new Date();

    if (!stopDate) {
        if (dates.length) {
            stopDate = new Date(dates[0][1]);
        } else {
            stopDate = now;
        }
    }

    if (!currentDate) {
        if (dates.length) {
            currentDate = new Date(dates[dates.length - 1][1]);
        } else {
            currentDate = now;
        }
    }

    // Set the date at the middle of the month to avoid issues
    // with different numbers of days in a month.
    currentDate.setDate(15);
    stopDate.setDate(15);

    const ticks: Date[] = [];

    while (currentDate >= stopDate) {
        ticks.push(currentDate);
        currentDate = decrement(currentDate);
        currentDate.setDate(15);
    }

    function makeDataset(name: string, mapIndex: number, color: string) {
        const data = [];
        for (const tickDate of ticks) {
            const entry = map.get(datekey(tickDate));
            data.push(entry ? round2(entry[mapIndex]) : null);
        }

        return {
            label: name,
            data,
            backgroundColor: color,
        };
    }

    const wellsColors = getWellsColors(theme);

    const datasets = [
        makeDataset($t('client.charts.received'), POS, wellsColors.RECEIVED),
        makeDataset($t('client.charts.spent'), NEG, wellsColors.SPENT),
        makeDataset($t('client.charts.saved'), BAL, wellsColors.SAVED),
    ];

    const labels = ticks.reverse().map(formatLabel);

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

interface InitialProps {
    allowMultipleCurrenciesDisplay?: boolean;
    accessId: number;
    fromDate?: Date;
    toDate?: Date;
}

const BarChart = (
    props: {
        chartId: string;
        frequency: string;
        theme: string;
        chartSize: number;
        transactions: Transaction[];
    } & Pick<InitialProps, 'fromDate' | 'toDate'>
) => {
    const container = useRef<Chart>();

    const redraw = useCallback(() => {
        container.current = createChartPositiveNegative(
            props.chartId,
            props.frequency,
            props.transactions,
            props.theme,
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

// Returns extra properties to be used in in-out charts.
// `initialCurrency` is either set to ALL_CURRENCIES or the first currency seen
// in transactions, or it is undefined if there were no transactions.
function useInOutExtraProps(props: InitialProps) {
    let dateFilter: (date: Date) => boolean;
    if (props.fromDate && props.toDate) {
        dateFilter = d => d >= (props as any).fromDate && d <= (props as any).toDate;
    } else if (props.fromDate) {
        dateFilter = d => d >= (props as any).fromDate;
    } else if (props.toDate) {
        dateFilter = d => d <= (props as any).toDate;
    } else {
        dateFilter = () => true;
    }

    const currencyToTransactions = useKresusState(state => {
        const currentAccountIds = get.accountIdsByAccessId(state, props.accessId);

        const ret = new Map<string, Transaction[]>();
        for (const accId of currentAccountIds) {
            const account = get.accountById(state, accId);
            if (account.excludeFromBalance) {
                continue;
            }

            const currency = account.currency;
            if (!ret.has(currency)) {
                ret.set(currency, []);
            }
            const transactions = get
                .transactionsByAccountId(state, accId)
                .filter(
                    t =>
                        t.type !== INTERNAL_TRANSFER_TYPE.name && dateFilter(t.budgetDate || t.date)
                );
            const entry = ret.get(currency);
            assert(typeof entry !== 'undefined', 'just created');
            entry.push(...transactions);
        }
        return ret;
    });

    let initialCurrency: string | undefined;
    if (
        typeof props.allowMultipleCurrenciesDisplay === 'undefined' ||
        props.allowMultipleCurrenciesDisplay
    ) {
        initialCurrency = ALL_CURRENCIES;
    } else {
        // If only one currency chart is allowed, display the first.
        initialCurrency = currencyToTransactions.keys().next().value;
    }

    return {
        chartIdPrefix: `barchart-${props.accessId}`,
        currencyToTransactions,
        initialCurrency,
    };
}

interface InOutChartProps extends InitialProps {
    // The current theme.
    theme: string;

    // The chart height.
    chartSize?: number;
}

const InOutChart = (props: InOutChartProps) => {
    const [lowDate, setLowDate] = useState(props.fromDate);
    const [highDate, setHighDate] = useState(props.toDate);

    const { chartIdPrefix, currencyToTransactions, initialCurrency } = useInOutExtraProps({
        allowMultipleCurrenciesDisplay: props.allowMultipleCurrenciesDisplay,
        accessId: props.accessId,
        fromDate: lowDate,
        toDate: highDate,
    });

    const [currentCurrency, setCurrency] = useState(initialCurrency);

    const selectDateRange = useCallback(
        (dates: [Date, Date?] | null) => {
            if (dates === null) {
                setLowDate(undefined);
                setHighDate(undefined);
            } else {
                setLowDate(dates[0]);
                if (typeof dates[1] !== 'undefined') {
                    setHighDate(dates[1]);
                }
            }
        },
        [setLowDate, setHighDate]
    );

    const setDateRange = useCallback(
        (dates: [Date, Date]) => {
            setLowDate(dates[0]);
            setHighDate(dates[1]);
        },
        [setLowDate, setHighDate]
    );

    let dateRangeValue: [Date] | [Date, Date] | undefined;
    if (typeof lowDate !== 'undefined') {
        if (typeof highDate !== 'undefined') {
            dateRangeValue = [lowDate, highDate];
        } else {
            dateRangeValue = [lowDate];
        }
    }

    const defaultFrequency = useKresusState(state => get.setting(state, DEFAULT_CHART_FREQUENCY));
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

    const charts = [];
    for (const [currency, transactions] of currencyToTransactions) {
        if (currentCurrency !== ALL_CURRENCIES && currentCurrency !== currency) {
            continue;
        }

        charts.push(
            <div key={currency}>
                <DisplayIf condition={currentCurrency === ALL_CURRENCIES}>
                    <h3>
                        {currency} {$t('client.charts.currency_no_conversion')}
                    </h3>
                </DisplayIf>

                <BarChart
                    chartId={`${chartIdPrefix}-${currency}`}
                    transactions={transactions}
                    theme={props.theme}
                    chartSize={props.chartSize || CHART_SIZE}
                    frequency={currentFrequency}
                    fromDate={lowDate}
                    toDate={highDate}
                />
            </div>
        );
    }

    const currencySelect =
        currencyToTransactions.size > 1 ? (
            <Form.Input id="currenty-select" label={$t('client.charts.currency_filter')}>
                <CurrencySelect
                    allowMultiple={true}
                    value={currentCurrency || ALL_CURRENCIES}
                    currencies={Array.from(currencyToTransactions.keys())}
                    onChange={setCurrency}
                />
            </Form.Input>
        ) : null;

    return (
        <>
            <DiscoveryMessage message={$t('client.charts.differences_all_desc')} />

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

                {currencySelect}
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
    theme: string;
}

export const DashboardInOutChart = (props: DashboardInOutChartProps) => {
    const { chartIdPrefix, currencyToTransactions, initialCurrency } = useInOutExtraProps({
        allowMultipleCurrenciesDisplay: false,
        accessId: props.accessId,
        fromDate: props.fromDate,
        toDate: props.toDate,
    });

    // Might not have set the default Chart theme yet...
    Chart.defaults.color = getFontColor(props.theme);

    const [currentCurrency, setCurrency] = useState(initialCurrency);

    if (typeof currentCurrency === 'undefined') {
        // No currency means no transactions, so just bail out.
        return null;
    }

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
                    theme={props.theme}
                    chartSize={props.chartSize}
                    frequency="monthly"
                />
            </div>
        </>
    );
};
