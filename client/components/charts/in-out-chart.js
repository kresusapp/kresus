import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import c3 from 'c3';

import { get } from '../../store';
import { translate as $t, round2, getWellsColors, INTERNAL_TRANSFER_TYPE } from '../../helpers';

import ChartComponent from './chart-base';
import DisplayIf from '../ui/display-if';
import DiscoveryMessage from '../ui/discovery-message';

const CHART_SIZE = 600;
const SUBCHART_SIZE = 100;

// Initial subchart extent, in months.
const SUBCHART_EXTENT = 3;

function createChartPositiveNegative(chartId, operations, theme, chartSize, subchartSize) {
    function datekey(op) {
        let d = op.budgetDate;
        return `${d.getFullYear()} - ${d.getMonth()}`;
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
    for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
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
        // Undefined means the default locale
        let defaultLocale;
        let str = date.toLocaleDateString(defaultLocale, {
            year: '2-digit',
            month: 'short'
        });
        categories.push(str);
    }

    // Show last ${SUBCHART_EXTENT} months in the subchart.
    let monthsRange = subchartSize > 0 ? SUBCHART_EXTENT : 1;
    let lowExtent = Math.max(dates.length, monthsRange) - monthsRange;
    let highExtent = dates.length;

    let yAxisLegend = $t('client.charts.amount');

    return c3.generate({
        bindto: chartId,

        data: {
            columns: series,
            type: 'bar',
            colors: colorMap
        },

        bar: {
            width: {
                ratio: 0.5
            }
        },

        axis: {
            x: {
                type: 'category',
                extent: [lowExtent, highExtent],
                categories,
                tick: {
                    // If we only display 1 month we want to force C3 to display the tick label on
                    // 1 line.
                    fit: monthsRange === 1
                }
            },

            y: {
                label: yAxisLegend
            }
        },

        grid: {
            x: {
                show: true
            },
            y: {
                show: true,
                lines: [{ value: 0 }]
            }
        },

        size: {
            height: chartSize
        },

        subchart: {
            show: subchartSize > 0,
            size: {
                height: subchartSize
            }
        },

        zoom: {
            rescale: true
        }
    });
}

class BarChart extends ChartComponent {
    redraw() {
        this.container = createChartPositiveNegative(
            `#${this.props.chartId}`,
            this.props.operations,
            this.props.theme,
            this.props.chartSize,
            this.props.subchartSize
        );
    }

    render() {
        return <div id={this.props.chartId} style={{ width: '100%' }} />;
    }
}

const ALL_CURRENCIES = '';

class InOutChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currency: props.initialView
        };
    }

    handleCurrencyChange = event => {
        this.setState({ currency: event.target.value });
    };

    render() {
        let currenciesOptions = [];
        if (this.props.allowMultipleCurrenciesDisplay) {
            currenciesOptions.push(
                <option key={ALL_CURRENCIES} value={ALL_CURRENCIES}>
                    {$t('client.charts.all_currencies')}
                </option>
            );
        }

        let currencyCharts = [];
        for (let [currency, transactions] of this.props.currencyToTransactions) {
            currenciesOptions.push(
                <option key={currency} value={currency}>
                    {currency}
                </option>
            );

            if (this.state.currency !== ALL_CURRENCIES && this.state.currency !== currency) {
                continue;
            }

            currencyCharts.push(
                <div key={currency}>
                    <DisplayIf condition={this.state.currency === ALL_CURRENCIES}>
                        <h3>{currency}</h3>
                    </DisplayIf>
                    <BarChart
                        chartId={`${this.props.chartIdPrefix}-${currency}`}
                        operations={transactions}
                        theme={this.props.theme}
                        chartSize={this.props.chartSize}
                        subchartSize={this.props.subchartSize}
                    />
                </div>
            );
        }

        return (
            <React.Fragment>
                <DisplayIf condition={!this.props.hideDiscoveryMessages}>
                    <DiscoveryMessage message={$t('client.charts.differences_all_desc')} />
                </DisplayIf>

                <DisplayIf condition={currenciesOptions.length > 1}>
                    <p>
                        <select
                            className="form-element-block"
                            onChange={this.handleCurrencyChange}
                            defaultValue={this.state.currency}>
                            {currenciesOptions}
                        </select>
                    </p>
                </DisplayIf>
                {currencyCharts}
            </React.Fragment>
        );
    }
}

InOutChart.propTypes = {
    // The transactions per currencies.
    currencyToTransactions: PropTypes.instanceOf(Map).isRequired,

    // The current theme.
    theme: PropTypes.string.isRequired,

    // The chart height.
    chartSize: PropTypes.number.isRequired,

    // The subchart height.
    subchartSize: PropTypes.number.isRequired,

    // Whether to allow to display every currency charts
    allowMultipleCurrenciesDisplay: PropTypes.bool.isRequired,

    // The default view to display.
    initialView: PropTypes.string.isRequired,

    // The chart identifier prefix (will be suffixed with the currency)
    chartIdPrefix: PropTypes.string.isRequired,

    // Whether to hide discovery messages (for example when the component is embedded).
    hideDiscoveryMessages: PropTypes.bool.isRequired
};

InOutChart.defaultProps = {
    chartSize: CHART_SIZE,
    subchartSize: SUBCHART_SIZE,
    allowMultipleCurrenciesDisplay: true,
    initialView: ALL_CURRENCIES,
    chartIdPrefix: 'barchart',
    hideDiscoveryMessages: false
};

const Export = connect((state, ownProps) => {
    let currentAccountIds = get.accountIdsByAccessId(state, ownProps.accessId);

    let currencyToTransactions = new Map();
    for (let accId of currentAccountIds) {
        let currency = get.accountById(state, accId).currency;
        if (!currencyToTransactions.has(currency)) {
            currencyToTransactions.set(currency, []);
        }
        let transactions = get
            .operationsByAccountId(state, accId)
            .filter(t => t.type !== INTERNAL_TRANSFER_TYPE.name);

        if (ownProps.fromDate) {
            transactions = transactions.filter(t => t.date >= ownProps.fromDate);
        }

        if (ownProps.toDate) {
            transactions = transactions.filter(t => t.date <= ownProps.toDate);
        }

        currencyToTransactions.get(currency).push(...transactions);
    }

    let initialView = ALL_CURRENCIES;

    // If only one currency chart is allowed, display the first.
    if (!ownProps.allowMultipleCurrenciesDisplay) {
        initialView = currencyToTransactions.keys().next().value;
    }

    return {
        chartIdPrefix: `barchart-${ownProps.accessId}`,
        currencyToTransactions,
        initialView
    };
})(InOutChart);

export default Export;
