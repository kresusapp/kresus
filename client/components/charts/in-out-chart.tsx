import React, { useCallback, useEffect, useRef, useState } from 'react';
import c3 from 'c3';

import { get } from '../../store';
import {
    getWellsColors,
    useKresusState,
    assert,
    translate as $t,
    round2,
    INTERNAL_TRANSFER_TYPE,
} from '../../helpers';
import { DEFAULT_CHART_FREQUENCY } from '../../../shared/settings';

import DisplayIf from '../ui/display-if';
import DiscoveryMessage from '../ui/discovery-message';

import FrequencySelect from './frequency-select';
import CurrencySelect, { ALL_CURRENCIES } from './currency-select';
import { Operation } from '../../models';

const CHART_SIZE = 600;
const SUBCHART_SIZE = 100;

// Initial subchart extent, in months.
const SUBCHART_EXTENT = 3;

function datekeyMonthly(op: Operation) {
    const d = op.budgetDate;
    return `${d.getFullYear()} - ${d.getMonth()}`;
}

function datekeyYearly(op: Operation) {
    const d = op.budgetDate;
    return `${d.getFullYear()}`;
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
    transactions: Operation[],
    theme: string,
    chartSize: number,
    subchartSize: number
) {
    let datekey;
    let formatLabel;
    switch (frequency) {
        case 'monthly':
            datekey = datekeyMonthly;
            formatLabel = formatLabelMonthly;
            break;
        case 'yearly':
            datekey = datekeyYearly;
            formatLabel = formatLabelYearly;
            break;
        default:
            assert(false, `unexpected frequency [${frequency}]`);
    }

    const POS = 0,
        NEG = 1,
        BAL = 2;

    // Type -> color
    const colorMap: Record<string, string> = {};

    // Month -> [Positive amount, Negative amount, Diff]
    const map = new Map<string, [number, number, number]>();
    // Datekey -> Date
    const dateset = new Map();
    for (let i = 0; i < transactions.length; i++) {
        const op = transactions[i];
        const dk = datekey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        const triplet = map.get(dk);
        assert(typeof triplet !== 'undefined', 'just created');

        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +op.budgetDate);
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    const dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    const series: Array<[string, ...number[]]> = [];
    function addSerie(name: string, mapIndex: number, color: string) {
        const data = [];
        for (let j = 0; j < dates.length; j++) {
            const dk = dates[j][0];
            const entry = map.get(dk);
            assert(typeof entry !== 'undefined', 'defined');
            data.push(round2(entry[mapIndex]));
        }
        series.push([name, ...data]);
        colorMap[name] = color;
    }

    const wellsColors = getWellsColors(theme);
    addSerie($t('client.charts.received'), POS, wellsColors.RECEIVED);
    addSerie($t('client.charts.spent'), NEG, wellsColors.SPENT);
    addSerie($t('client.charts.saved'), BAL, wellsColors.SAVED);

    const categories: string[] = [];
    for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i][1]);
        const str = formatLabel(date);
        categories.push(str);
    }

    // Show last ${SUBCHART_EXTENT} periods in the subchart.
    const periodRanges = subchartSize > 0 ? SUBCHART_EXTENT : 1;
    const lowExtent = Math.max(dates.length, periodRanges) - periodRanges;
    const highExtent = dates.length;

    const yAxisLegend = $t('client.charts.amount');

    return c3.generate({
        bindto: chartId,

        data: {
            columns: series,
            type: 'bar',
            colors: colorMap,
        },

        bar: {
            width: {
                ratio: 0.5,
            },
        },

        axis: {
            x: {
                type: 'category',
                extent: [lowExtent, highExtent],
                categories,
                tick: {
                    // If we only display 1 period we want to force C3 to
                    // display the tick label on 1 line.
                    fit: highExtent - lowExtent === 1,
                },
            },

            y: {
                label: yAxisLegend,
            },
        },

        grid: {
            x: {
                show: true,
            },
            y: {
                show: true,
                lines: [{ value: 0 }],
            },
        },

        size: {
            height: chartSize,
        },

        subchart: {
            show: subchartSize > 0,
            size: {
                height: subchartSize,
            },
        },

        zoom: {
            rescale: true,
        },
    });
}

const BarChart = (props: {
    chartId: string;
    frequency: string;
    theme: string;
    chartSize: number;
    subchartSize: number;
    transactions: Operation[];
}) => {
    const container = useRef<c3.ChartAPI>();

    const redraw = useCallback(() => {
        container.current = createChartPositiveNegative(
            `#${props.chartId}`,
            props.frequency,
            props.transactions,
            props.theme,
            props.chartSize,
            props.subchartSize
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

    return <div id={props.chartId} style={{ width: '100%' }} />;
};

interface InitialProps {
    allowMultipleCurrenciesDisplay?: boolean;
    accessId: number;
    fromDate?: Date;
    toDate?: Date;
}

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

        const ret = new Map<string, Operation[]>();
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
                .operationsByAccountId(state, accId)
                .filter(t => t.type !== INTERNAL_TRANSFER_TYPE.name && dateFilter(t.budgetDate));
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

    // The subchart height.
    subchartSize?: number;
}

const InOutChart = (props: InOutChartProps) => {
    const { chartIdPrefix, currencyToTransactions, initialCurrency } = useInOutExtraProps({
        allowMultipleCurrenciesDisplay: props.allowMultipleCurrenciesDisplay,
        accessId: props.accessId,
        fromDate: props.fromDate,
        toDate: props.toDate,
    });

    const [currentCurrency, setCurrency] = useState(initialCurrency);

    const defaultFrequency = useKresusState(state => get.setting(state, DEFAULT_CHART_FREQUENCY));
    assert(
        defaultFrequency === 'monthly' || defaultFrequency === 'yearly',
        'known default frequency'
    );
    const [currentFrequency, setFrequency] = useState<'monthly' | 'yearly'>(defaultFrequency);

    const charts = [];
    for (const [currency, transactions] of currencyToTransactions) {
        if (currentCurrency !== ALL_CURRENCIES && currentCurrency !== currency) {
            continue;
        }

        charts.push(
            <div key={currency}>
                <DisplayIf condition={currentCurrency === ALL_CURRENCIES}>
                    <h3>{currency}</h3>
                </DisplayIf>

                <BarChart
                    chartId={`${chartIdPrefix}-${currency}`}
                    transactions={transactions}
                    theme={props.theme}
                    chartSize={props.chartSize || CHART_SIZE}
                    subchartSize={props.subchartSize || SUBCHART_SIZE}
                    frequency={currentFrequency}
                />
            </div>
        );
    }

    const currencySelect =
        !!currentCurrency && currencyToTransactions.size > 1 ? (
            <p>
                <CurrencySelect
                    allowMultiple={true}
                    value={currentCurrency}
                    currencies={Array.from(currencyToTransactions.keys())}
                    onChange={setCurrency}
                />
            </p>
        ) : null;

    return (
        <>
            <DiscoveryMessage message={$t('client.charts.differences_all_desc')} />

            <p>
                <label htmlFor="frequency">{$t('client.charts.frequency')}</label>
                <FrequencySelect value={currentFrequency} onChange={setFrequency} id="frequency" />
            </p>

            {currencySelect}

            {charts}
        </>
    );
};

export default InOutChart;

interface DashboardInOutChartProps {
    accessId: number;
    chartSize: number;
    subchartSize: number;
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
                    subchartSize={props.subchartSize}
                    frequency="monthly"
                />
            </div>
        </>
    );
};
