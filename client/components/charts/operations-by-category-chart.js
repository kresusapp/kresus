import React from 'react';
import { connect } from 'react-redux';
import c3 from 'c3';

import { assert, round2, translate as $t } from '../../helpers';
import { get } from '../../store';
import { Operation } from '../../models';

import OpCatChartPeriodSelect from './operations-by-category-period-select';
import OpAmountTypeSelect from './operations-by-amount-type-select';

import ChartComponent from './chart-base';

// Charts algorithms.
function createBarChartAll(getCategoryById, operations, barchartId) {
    function datekey(op) {
        let d = op.budgetDate;
        return `${d.getFullYear()}-${d.getMonth()}`;
    }

    // Category -> {Month -> [Amounts]}
    let map = new Map();

    // Category -> color
    let colorMap = {};

    // Datekey -> Date
    let dateset = new Map();
    for (let i = 0, size = operations.length; i < size; i++) {
        let op = operations[i];
        let c = getCategoryById(op.categoryId);

        map.set(c.title, map.get(c.title) || {});
        let categoryDates = map.get(c.title);

        let dk = datekey(op);
        (categoryDates[dk] = categoryDates[dk] || []).push(op.amount);
        dateset.set(dk, +op.budgetDate);

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
            let values = (map.get(c)[dk] = map.get(c)[dk] || []);
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
            year: '2-digit',
            month: 'short'
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
                ratio: 0.5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories,
                tick: {
                    fit: false
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
        }
    });
}

function createPieChartAll(getCategoryById, operations, chartId) {
    let catMap = new Map();
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
        let c = getCategoryById(catId);
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

class OpCatChart extends ChartComponent {
    constructor(props) {
        super(props);

        this.state = {
            showPositiveOps: props.showPositiveOps,
            showNegativeOps: props.showNegativeOps,
            period: props.defaultPeriod
        };

        this.handleRedraw = this.redraw.bind(this);
        this.handleHideAll = this.handleHideAll.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
        this.handleAmountTypeChange = this.setState.bind(this);
        this.handleChangePeriod = this.handleChangePeriod.bind(this);
    }

    handleChangePeriod(event) {
        this.setState(
            {
                period: event.target.value
            },
            this.handleRedraw
        );
    }

    createPeriodFilter(option) {
        let date = new Date();
        let year = date.getFullYear();
        // Careful: January is month 0
        let month = date.getMonth();
        let previous;

        switch (option) {
            case 'all':
                return () => true;

            case 'current-month':
                return d => d.getMonth() === month && d.getFullYear() === year;

            case 'last-month':
                previous = month > 0 ? month - 1 : 11;
                year = month > 0 ? year : year - 1;
                return d => d.getMonth() === previous && d.getFullYear() === year;

            case '3-months':
                if (month >= 3) {
                    previous = month - 3;
                    return d => d.getMonth() >= previous && d.getFullYear() === year;
                }
                previous = (month + 9) % 12;
                return d =>
                    (d.getMonth() >= previous && d.getFullYear() === year - 1) ||
                    (d.getMonth() <= month && d.getFullYear() === year);

            case '6-months':
                if (month >= 6) {
                    previous = month - 6;
                    return d => d.getMonth() >= previous && d.getFullYear() === year;
                }
                previous = (month + 6) % 12;
                return d =>
                    (d.getMonth() >= previous && d.getFullYear() === year - 1) ||
                    (d.getMonth() <= month && d.getFullYear() === year);

            default:
                assert(false, 'unexpected option for date filter');
        }
    }

    redraw() {
        let ops = this.props.operations.slice();

        // Period
        let period = this.state.period;
        let periodFilter = this.createPeriodFilter(period);
        ops = ops.filter(op => periodFilter(op.budgetDate));

        // Kind
        if (this.state.showNegativeOps && !this.state.showPositiveOps) {
            ops = ops.filter(op => op.amount < 0);
        } else if (!this.state.showNegativeOps && this.state.showPositiveOps) {
            ops = ops.filter(op => op.amount > 0);
        }

        // Invert values on the negative chart.
        if (this.state.showNegativeOps) {
            ops = ops.map(op => {
                let ret = new Operation(op, '');
                ret.amount = -ret.amount;
                return ret;
            });
        }

        // Print charts
        this.barchart = createBarChartAll(this.props.getCategoryById, ops, '#barchart');
        if (!this.state.showPositiveOps || !this.state.showNegativeOps) {
            this.piechart = createPieChartAll(this.props.getCategoryById, ops, '#piechart');
        } else {
            document.querySelector('#piechart').innerHTML = '';
            this.piechart = null;
        }
    }

    handleShowAll() {
        if (this.barchart) {
            this.barchart.show();
        }
        if (this.piechart) {
            this.piechart.show();
        }
    }

    handleHideAll() {
        if (this.barchart) {
            this.barchart.hide();
        }
        if (this.piechart) {
            this.piechart.hide();
        }
    }

    render() {
        return (
            <React.Fragment>
                <form>
                    <div>
                        <label>{$t('client.charts.amount_type')}</label>

                        <OpAmountTypeSelect
                            showPositiveOps={this.state.showPositiveOps}
                            showNegativeOps={this.state.showNegativeOps}
                            onChange={this.handleAmountTypeChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="period">{$t('client.charts.period')}</label>
                        <p>
                            <OpCatChartPeriodSelect
                                defaultValue={this.props.defaultPeriod}
                                onChange={this.handleChangePeriod}
                                htmlId="period"
                            />
                        </p>
                    </div>

                    <div>
                        <label>{$t('client.menu.categories')}</label>

                        <p
                            className="buttons btn-group"
                            role="group"
                            aria-label="Show/Hide categories">
                            <button
                                type="button"
                                className="btn btn-default"
                                onClick={this.handleHideAll}>
                                {$t('client.general.unselect_all')}
                            </button>
                            <button
                                type="button"
                                className="btn btn-default"
                                onClick={this.handleShowAll}>
                                {$t('client.general.select_all')}
                            </button>
                        </p>
                    </div>
                </form>

                <div id="barchart" style={{ width: '100%' }} />

                <div id="piechart" style={{ width: '100%' }} />
            </React.Fragment>
        );
    }
}

const Export = connect(state => {
    let defaultAmountType = get.setting(state, 'defaultChartType');
    let defaultPeriod = get.setting(state, 'defaultChartPeriod');
    let showNegativeOps = ['all', 'negative'].includes(defaultAmountType);
    let showPositiveOps = ['all', 'positive'].includes(defaultAmountType);

    return {
        showPositiveOps,
        showNegativeOps,
        defaultPeriod,
        getCategoryById: id => get.categoryById(state, id)
    };
})(OpCatChart);

export default Export;
