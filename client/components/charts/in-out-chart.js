import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import c3 from 'c3';

import { get } from '../../store';
import {
    assert,
    translate as $t,
    round2,
    getWellsColors,
    INTERNAL_TRANSFER_TYPE,
} from '../../helpers';
import { DEFAULT_CHART_FREQUENCY } from '../../../shared/settings';

import DisplayIf from '../ui/display-if';
import DiscoveryMessage from '../ui/discovery-message';

import ChartComponent from './chart-base';
import FrequencySelect from './frequency-select';
import CurrencySelect, { ALL_CURRENCIES } from './currency-select';

const CHART_SIZE = 600;
const SUBCHART_SIZE = 100;

// Initial subchart extent, in months.
const SUBCHART_EXTENT = 3;

function datekeyMonthly(op) {
    let d = op.budgetDate;
    return `${d.getFullYear()} - ${d.getMonth()}`;
}

function datekeyYearly(op) {
    let d = op.budgetDate;
    return `${d.getFullYear()}`;
}

function formatLabelMonthly(date) {
    // Undefined means the default locale
    let defaultLocale;
    return date.toLocaleDateString(defaultLocale, {
        year: '2-digit',
        month: 'short',
    });
}

function formatLabelYearly(date) {
    return `${date.getFullYear()}`;
}

function createChartPositiveNegative(
    chartId,
    frequency,
    transactions,
    theme,
    chartSize,
    subchartSize
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
    let colorMap = {};

    // Month -> [Positive amount, Negative amount, Diff]
    let map = new Map();
    // Datekey -> Date
    let dateset = new Map();
    for (let i = 0; i < transactions.length; i++) {
        let op = transactions[i];
        let dk = datekey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        let triplet = map.get(dk);
        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +op.budgetDate);
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    let dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    let series = [];
    function addSerie(name, mapIndex, color) {
        let data = [];
        for (let j = 0; j < dates.length; j++) {
            let dk = dates[j][0];
            data.push(round2(map.get(dk)[mapIndex]));
        }
        let serie = [name].concat(data);
        series.push(serie);
        colorMap[name] = color;
    }

    const wellsColors = getWellsColors(theme);
    addSerie($t('client.charts.received'), POS, wellsColors.RECEIVED);
    addSerie($t('client.charts.spent'), NEG, wellsColors.SPENT);
    addSerie($t('client.charts.saved'), BAL, wellsColors.SAVED);

    let categories = [];
    for (let i = 0; i < dates.length; i++) {
        let date = new Date(dates[i][1]);
        let str = formatLabel(date);
        categories.push(str);
    }

    // Show last ${SUBCHART_EXTENT} periods in the subchart.
    let periodRanges = subchartSize > 0 ? SUBCHART_EXTENT : 1;
    let lowExtent = Math.max(dates.length, periodRanges) - periodRanges;
    let highExtent = dates.length;

    let yAxisLegend = $t('client.charts.amount');

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

class BarChart extends ChartComponent {
    redraw() {
        this.container = createChartPositiveNegative(
            `#${this.props.chartId}`,
            this.props.frequency,
            this.props.transactions,
            this.props.theme,
            this.props.chartSize,
            this.props.subchartSize
        );
    }

    render() {
        return <div id={this.props.chartId} style={{ width: '100%' }} />;
    }
}

const InOutChart = props => {
    let [currentCurrency, setCurrency] = useState(props.initialCurrency);
    let [currentFrequency, setFrequency] = useState(props.defaultFrequency);

    let charts = [];
    for (let [currency, transactions] of props.currencyToTransactions) {
        if (currentCurrency !== ALL_CURRENCIES && currentCurrency !== currency) {
            continue;
        }

        charts.push(
            <div key={currency}>
                <DisplayIf condition={currentCurrency === ALL_CURRENCIES}>
                    <h3>{currency}</h3>
                </DisplayIf>

                <BarChart
                    chartId={`${props.chartIdPrefix}-${currency}`}
                    transactions={transactions}
                    theme={props.theme}
                    chartSize={props.chartSize}
                    subchartSize={props.subchartSize}
                    frequency={currentFrequency}
                />
            </div>
        );
    }

    return (
        <>
            <DiscoveryMessage message={$t('client.charts.differences_all_desc')} />

            <p>
                <label htmlFor="frequency">{$t('client.charts.frequency')}</label>
                <FrequencySelect
                    value={currentFrequency}
                    onChange={setFrequency}
                    htmlId="frequency"
                />
            </p>

            <DisplayIf condition={props.currencyToTransactions.size > 1}>
                <p>
                    <CurrencySelect
                        allowMultiple={true}
                        value={currentCurrency}
                        currencies={props.currencyToTransactions.keys()}
                        onChange={setCurrency}
                    />
                </p>
            </DisplayIf>

            {charts}
        </>
    );
};

InOutChart.propTypes = {
    // The transactions per currencies.
    currencyToTransactions: PropTypes.instanceOf(Map).isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,

    // The chart height.
    chartSize: PropTypes.number.isRequired,

    // The subchart height.
    subchartSize: PropTypes.number.isRequired,

    // The default view to display.
    initialCurrency: PropTypes.string.isRequired,

    // The chart identifier prefix (will be suffixed with the currency)
    chartIdPrefix: PropTypes.string.isRequired,
};

InOutChart.defaultProps = {
    chartSize: CHART_SIZE,
    subchartSize: SUBCHART_SIZE,
    allowMultipleCurrenciesDisplay: true,
    initialCurrency: ALL_CURRENCIES,
    chartIdPrefix: 'barchart',
};

function connectStateToProps(state, props) {
    let defaultFrequency = get.setting(state, DEFAULT_CHART_FREQUENCY);
    let currentAccountIds = get.accountIdsByAccessId(state, props.accessId);
    let dateFilter;
    if (props.fromDate && props.toDate) {
        dateFilter = t => t.date >= props.fromDate && t.date <= props.toDate;
    } else if (props.fromDate) {
        dateFilter = t => t.date >= props.fromDate;
    } else if (props.toDate) {
        dateFilter = t => t.date <= props.toDate;
    } else {
        dateFilter = () => true;
    }

    let currencyToTransactions = new Map();
    for (let accId of currentAccountIds) {
        let currency = get.accountById(state, accId).currency;
        if (!currencyToTransactions.has(currency)) {
            currencyToTransactions.set(currency, []);
        }
        let transactions = get
            .operationsByAccountId(state, accId)
            .filter(t => t.type !== INTERNAL_TRANSFER_TYPE.name && dateFilter(t));
        currencyToTransactions.get(currency).push(...transactions);
    }

    let initialCurrency;
    if (!props.allowMultipleCurrenciesDisplay) {
        // If only one currency chart is allowed, display the first.
        initialCurrency = currencyToTransactions.keys().next().value;
    } else {
        initialCurrency = ALL_CURRENCIES;
    }

    return {
        chartIdPrefix: `barchart-${props.accessId}`,
        defaultFrequency,
        currencyToTransactions,
        initialCurrency,
    };
}

export default connect(connectStateToProps)(InOutChart);

export const DashboardInOutChart = connect(connectStateToProps)(props => {
    let [currentCurrency, setCurrency] = useState(props.initialCurrency);

    return (
        <>
            <DisplayIf condition={props.currencyToTransactions.size > 1}>
                <p>
                    <CurrencySelect
                        allowMultiple={false}
                        value={currentCurrency}
                        currencies={props.currencyToTransactions.keys()}
                        onChange={setCurrency}
                    />
                </p>
            </DisplayIf>

            <div>
                <BarChart
                    chartId={`${props.chartIdPrefix}-${currentCurrency}`}
                    transactions={props.currencyToTransactions.get(currentCurrency)}
                    theme={props.theme}
                    chartSize={props.chartSize}
                    subchartSize={props.subchartSize}
                    frequency="monthly"
                />
            </div>
        </>
    );
});

DashboardInOutChart.defaultProps = {
    allowMultipleCurrenciesDisplay: false,
};
