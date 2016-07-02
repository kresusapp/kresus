/* globals c3: false, Dygraph: false */
import React from 'react';
import { connect } from 'react-redux';

import { store, State } from '../../store';
import { assert, debug, translate as $t } from '../../helpers';

import ChartComponent from './chart-base';
import OperationsByCategoryChart from './operations-by-category-chart';

function round2(x) {
    return Math.round(x * 100) / 100;
}

// Charts
export function createBarChartAll(operations, barchartId) {

    function datekey(op) {
        let d = op.date;
        return `${d.getFullYear()}-${d.getMonth()}`;
    }

    // Category -> {Month -> [Amounts]}
    let map = new Map;

    // Category -> color
    let colorMap = {};

    // Datekey -> Date
    let dateset = new Map;
    for (let i = 0, size = operations.length; i < size; i++) {
        let op = operations[i];
        let c = store.getCategoryFromId(op.categoryId);

        map.set(c.title, map.get(c.title) || {});
        let categoryDates = map.get(c.title);

        let dk = datekey(op);
        (categoryDates[dk] = categoryDates[dk] || []).push(op.amount);
        dateset.set(dk, +op.date);

        colorMap[c.title] = colorMap[c.title] || c.color;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    let dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    let series = [];
    for (let c of map.keys()) {
        let data = [];

        for (let j = 0; j < dates.length; j++) {
            let dk = dates[j][0];
            let values = map.get(c)[dk] = map.get(c)[dk] || [];
            data.push(round2(values.reduce((a, b) => a + b, 0)));
        }

        data = [c].concat(data);
        series.push(data);
    }

    let categories = [];
    for (let i = 0; i < dates.length; i++) {
        let date = new Date(dates[i][1]);
        // Undefined means the default locale
        let defaultLocale;
        let str = date.toLocaleDateString(defaultLocale, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    let yAxisLegend = $t('client.charts.amount');

    return c3.generate({

        bindto: barchartId,

        data: {
            columns: series,
            type: 'bar',
            colors: colorMap
        },

        bar: {
            width: {
                ratio: .5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories
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
        }
    });
}


export function createPieChartAll(operations, chartId) {

    let catMap = new Map;
    // categoryId -> [val1, val2, val3]
    for (let op of operations) {
        let catId = op.categoryId;
        let arr = catMap.has(catId) ? catMap.get(catId) : [];
        arr.push(op.amount);
        catMap.set(catId, arr);
    }

    // [ [categoryName, val1, val2], [anotherCategoryName, val3, val4] ]
    let series = [];
    // {label -> color}
    let colorMap = {};
    for (let [catId, valueArr] of catMap) {
        let c = store.getCategoryFromId(catId);
        series.push([c.title].concat(valueArr));
        colorMap[c.title] = c.color;
    }

    return c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'pie',
            colors: colorMap
        },

        tooltip: {
            format: {
                value(value, ratio) {
                    return `${round2(ratio * 100)}% (${Math.abs(round2(value))})`;
                }
            }
        }

    });
}


export function createChartBalance(chartId, account, operations) {

    if (account === null) {
        debug('ChartComponent: no account');
        return;
    }

    let ops = operations.slice().sort((a, b) => +a.date - +b.date);

    function makeKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    let opmap = new Map;

    // Fill all dates
    const DAY = 1000 * 60 * 60 * 24;

    let firstDate = ops.length ? +ops[0].date : Date.now();
    firstDate = (firstDate / DAY | 0) * DAY;

    let today = (Date.now() / DAY | 0) * DAY;
    for (; firstDate <= today; firstDate += DAY) {
        opmap.set(makeKey(new Date(firstDate)), 0);
    }

    // Date (day) -> cumulated sum of amounts for this day (scalar)
    for (let o of ops) {
        let key = makeKey(o.date);
        opmap.set(key, opmap.get(key) + o.amount);
    }

    let balance = account.initialAmount;
    let csv = 'Date,Balance\n';
    for (let [date, amount] of opmap) {
        balance += amount;
        csv += `${date},${round2(balance)}\n`;
    }

    /* eslint-disable no-new */

    // Create the chart
    new Dygraph(document.querySelector(chartId), csv);

    /* eslint-enable no-new */
}

export function createChartPositiveNegative(chartId, operations) {

    function datekey(op) {
        let d = op.date;
        return `${d.getFullYear()} - ${d.getMonth()}`;
    }

    const POS = 0, NEG = 1, BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    let map = new Map;
    // Datekey -> Date
    let dateset = new Map;
    for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
        let dk = datekey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        let triplet = map.get(dk);
        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +op.date);
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    let dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    let series = [];
    function addSerie(name, mapIndex) {
        let data = [];
        for (let j = 0; j < dates.length; j++) {
            let dk = dates[j][0];
            data.push(round2(map.get(dk)[mapIndex]));
        }
        let serie = [name].concat(data);
        series.push(serie);
    }

    addSerie($t('client.charts.received'), POS);
    addSerie($t('client.charts.spent'), NEG);
    addSerie($t('client.charts.saved'), BAL);

    let categories = [];
    for (let i = 0; i < dates.length; i++) {
        let date = new Date(dates[i][1]);
        // Undefined means the default locale
        let defaultLocale;
        let str = date.toLocaleDateString(defaultLocale, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    let yAxisLegend = $t('client.charts.amount');

    c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'bar'
        },

        bar: {
            width: {
                ratio: .5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories
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
        }
    });
}

class BalanceChart extends ChartComponent {

    redraw() {
        createChartBalance('#barchart', this.props.account, this.props.operations);
    }

    render() {
        return <div id="barchart" style={ { width: '100%' } }></div>;
    }
}

class InOutChart extends ChartComponent {

    redraw() {
        createChartPositiveNegative('#barchart', this.props.operations);
    }

    render() {
        return <div id="barchart" style={ { width: '100%' } }></div>;
    }
}

// Components
class ChartsComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            kind: 'all'
        };
    }

    changeKind(kind) {
        this.setState({ kind });
    }

    onClick(kind) {
        return () => this.changeKind(kind);
    }

    render() {
        let chartComponent = '';
        switch (this.state.kind) {
            case 'all': {
                chartComponent = (
                    <OperationsByCategoryChart
                      operations={ this.props.operations }
                    />
                );
                break;
            }
            case 'balance': {
                chartComponent = (
                    <BalanceChart
                      operations={ this.props.operations }
                      account={ this.props.account }
                    />
                );
                break;
            }
            case 'pos-neg': {
                // TODO gross
                let accounts = store.getCurrentBankAccounts().map(account => account.id);
                let ops = store.getOperationsByAccountsIds(accounts);
                chartComponent = <InOutChart operations={ ops } />;
                break;
            }
            default: assert(false, 'unexpected chart kind');
        }

        let isActive = function(which) {
            return which === this.state.kind ? 'active' : '';
        };
        isActive = isActive.bind(this);

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.charts.title') }
                    </h3>
                </div>

                <div className="panel-body">
                    <ul className="nav nav-pills" role="tablist">
                        <li role="presentation" className={ isActive('all') }>
                            <a href="#" onClick={ this.onClick('all') }>
                                { $t('client.charts.by_category') }
                            </a>
                        </li>
                        <li role="presentation" className={ isActive('balance') }>
                            <a href="#" onClick={ this.onClick('balance') }>
                                { $t('client.charts.balance') }
                            </a>
                        </li>
                        <li role="presentation" className={ isActive('pos-neg') }>
                            <a href="#" onClick={ this.onClick('pos-neg') }>
                                { $t('client.charts.differences_all') }
                            </a>
                        </li>
                    </ul>
                    <div className="tab-content">
                        { chartComponent }
                    </div>
                </div>
            </div>
        );
    }
}

const Export = connect(state => {
    let account = store.getCurrentAccount();
    let operations = store.getCurrentOperations();
    return {
        account,
        operations
    };
}, dispatch => {
    return {};
})(ChartsComponent);

export default Export;
