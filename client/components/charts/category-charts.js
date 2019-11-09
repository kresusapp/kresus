import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import c3 from 'c3';

import { assert, round2, translate as $t } from '../../helpers';
import { get } from '../../store';

import ChartComponent from './chart-base';

import DiscoveryMessage from '../ui/discovery-message';

export const PeriodSelect = props => {
    let onChange = event => {
        props.onChange(event.target.value);
    };

    return (
        <select
            className="form-element-block"
            defaultValue={props.defaultValue}
            onChange={onChange}
            id={props.htmlId}>
            <option key="value" value="all">
                {$t('client.charts.all_periods')}
            </option>
            <option key="current-month" value="current-month">
                {$t('client.charts.current_month')}
            </option>
            <option key="last-month" value="last-month">
                {$t('client.charts.last_month')}
            </option>
            <option key="3-months" value="3-months">
                {$t('client.charts.three_months')}
            </option>
            <option key="6-months" value="6-months">
                {$t('client.charts.six_months')}
            </option>
        </select>
    );
};

PeriodSelect.propTypes = {
    // Initial value.
    defaultValue: PropTypes.oneOf(['all', 'current-month', 'last-month', '3-months', '6-months']),

    // Callback getting the id of the selected option whenever it changes.
    onChange: PropTypes.func.isRequired,

    // CSS unique id.
    htmlId: PropTypes.string.isRequired
};

export const AmountKindSelect = props => {
    let onChange = event => {
        props.onChange(event.target.value);
    };

    return (
        <select
            className="form-element-block"
            defaultValue={props.defaultValue}
            onChange={onChange}>
            <option key="all" value="all">
                {$t('client.charts.incomes_and_expenses')}
            </option>
            <option key="positive" value="positive">
                {$t('client.charts.incomes')}
            </option>
            <option key="negative" value="negative">
                {$t('client.charts.expenses')}
            </option>
        </select>
    );
};

AmountKindSelect.propTypes = {
    // An initial value.
    defaultValue: PropTypes.oneOf(['all', 'positive', 'negative']),

    // A callback called whenever one of the inputs change.
    onChange: PropTypes.func.isRequired
};

class C3Component extends ChartComponent {
    hide() {
        this.container.hide();
    }

    show() {
        this.container.show();
    }

    render() {
        return <div id={this.props.chartId} />;
    }
}

C3Component.propTypes = {
    // A unique chart id that will serve as the container's id.
    chartId: PropTypes.string.isRequired
};

class BarChart extends C3Component {
    datekey(op) {
        let d = op.budgetDate;
        return `${d.getFullYear()}-${d.getMonth()}`;
    }

    redraw() {
        // Category -> {Month -> [Amounts]}.
        let map = new Map();

        // Category -> color.
        let colorMap = {};

        // Datekey -> Date.
        let dateset = new Map();
        for (let op of this.props.operations) {
            let c = this.props.getCategoryById(op.categoryId);

            map.set(c.label, map.get(c.label) || {});
            let categoryDates = map.get(c.label);

            let dk = this.datekey(op);
            let amount = this.props.invertSign ? -op.amount : op.amount;
            (categoryDates[dk] = categoryDates[dk] || []).push(amount);
            dateset.set(dk, +op.budgetDate);

            colorMap[c.label] = colorMap[c.label] || c.color;
        }

        // Sort date in ascending order: push all pairs of (datekey, date) in
        // an array and sort that array by the second element. Then read that
        // array in ascending order.
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

        let monthLabels = [];
        for (let i = 0; i < dates.length; i++) {
            let date = new Date(dates[i][1]);
            // Undefined means the default locale.
            let defaultLocale;
            let str = date.toLocaleDateString(defaultLocale, {
                year: '2-digit',
                month: 'short'
            });
            monthLabels.push(str);
        }

        let xAxisExtent;
        switch (this.props.period) {
            case 'current-month':
                xAxisExtent = [Math.max(0, monthLabels.length - 1), monthLabels.length];
                break;
            case 'last-month':
                xAxisExtent = [
                    Math.max(0, monthLabels.length - 2),
                    Math.max(0, monthLabels.length - 1)
                ];
                break;
            case '3-months':
                xAxisExtent = [Math.max(0, monthLabels.length - 3), monthLabels.length];
                break;
            default:
                // All times or last 6 months: only show 6 months at a time.
                xAxisExtent = [Math.max(0, monthLabels.length - 6), monthLabels.length];
                break;
        }

        this.container = c3.generate({
            bindto: `#${this.props.chartId}`,

            size: {
                height: 600
            },

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
                    categories: monthLabels,
                    tick: {
                        fit: false
                    },
                    extent: xAxisExtent
                },

                y: {
                    label: $t('client.charts.amount')
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

            subchart: {
                show: true,
                size: {
                    height: 80
                }
            },

            transition: {
                duration: 0
            },

            zoom: {
                rescale: true
            }
        });
    }
}

BarChart.propTypes = {
    // Function to map from a category id to its content.
    getCategoryById: PropTypes.func.isRequired,

    // Array containing all the operations.
    operations: PropTypes.array.isRequired,

    // Should we invert the amounts before making the bars?
    invertSign: PropTypes.bool.isRequired
};

class PieChart extends C3Component {
    redraw() {
        let catMap = new Map();

        // categoryId -> [val1, val2, val3].
        for (let op of this.props.operations) {
            let catId = op.categoryId;
            if (!catMap.has(catId)) {
                catMap.set(catId, []);
            }
            catMap.get(catId).push(op.amount);
        }

        // [ [categoryName, val1, val2], [anotherCategoryName, val3, val4] ].
        let series = [];
        // {label -> color}.
        let colorMap = {};

        for (let [catId, values] of catMap) {
            let c = this.props.getCategoryById(catId);
            series.push([c.label].concat(values));
            colorMap[c.label] = c.color;
        }

        this.container = c3.generate({
            bindto: `#${this.props.chartId}`,

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
}

PieChart.propTypes = {
    // Function to map from a category id to its content.
    getCategoryById: PropTypes.func.isRequired,

    // Array containing all the operations.
    operations: PropTypes.array.isRequired
};

class PieChartWithHelp extends React.Component {
    ref = React.createRef();

    show = () => {
        this.ref.current.show();
    };
    hide = () => {
        this.ref.current.hide();
    };

    render = () => {
        return (
            <div>
                <h3>
                    <span
                        className="tooltipped tooltipped-ne tooltipped-multiline"
                        aria-label={$t(this.props.helpKey)}>
                        <span className="fa fa-question-circle clickable" />
                    </span>
                    {$t(this.props.titleKey)}
                </h3>
                <PieChart
                    chartId={this.props.chartId}
                    getCategoryById={this.props.getCategoryById}
                    operations={this.props.ops}
                    ref={this.ref}
                />
            </div>
        );
    };
}

class AllPieCharts extends React.Component {
    state = {
        displayRawIncomeHelp: false,
        displayRawSpendingsHelp: false,
        displayNetIncomeHelp: false,
        displayNetSpendingsHelp: false
    };

    refRawIncome = React.createRef();
    refRawSpendings = React.createRef();
    refNetIncome = React.createRef();
    refNetSpendings = React.createRef();

    show = () => {
        this.refRawIncome.current.show();
        this.refRawSpendings.current.show();
        this.refNetIncome.current.show();
        this.refNetSpendings.current.show();
    };

    hide = () => {
        this.refRawIncome.current.hide();
        this.refRawSpendings.current.hide();
        this.refNetIncome.current.hide();
        this.refNetSpendings.current.hide();
    };

    render = () => {
        return (
            <div className="pie-charts">
                <PieChartWithHelp
                    chartId="rawIncomePie"
                    helpKey="client.charts.help_raw_income"
                    titleKey="client.charts.raw_income"
                    getCategoryById={this.props.getCategoryById}
                    ops={this.props.rawIncomeOps}
                    ref={this.refRawIncome}
                />

                <PieChartWithHelp
                    chartId="rawSpendingsPie"
                    helpKey="client.charts.help_raw_spendings"
                    titleKey="client.charts.raw_spendings"
                    getCategoryById={this.props.getCategoryById}
                    ops={this.props.rawSpendingOps}
                    ref={this.refRawSpendings}
                />

                <PieChartWithHelp
                    chartId="netIncomePie"
                    helpKey="client.charts.help_net_income"
                    titleKey="client.charts.net_income"
                    getCategoryById={this.props.getCategoryById}
                    ops={this.props.netIncomeOps}
                    ref={this.refNetIncome}
                />

                <PieChartWithHelp
                    chartId="netSpendingsPie"
                    helpKey="client.charts.help_net_spendings"
                    titleKey="client.charts.net_spendings"
                    getCategoryById={this.props.getCategoryById}
                    ops={this.props.netSpendingOps}
                    ref={this.refNetSpendings}
                />
            </div>
        );
    };
}

class CategorySection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amountKind: props.defaultAmountKind,
            period: props.defaultPeriod
        };
    }

    refBarchart = React.createRef();
    refPiecharts = React.createRef();

    handleChangePeriod = period => {
        this.setState({ period });
    };

    handleChangeAmountKind = amountKind => {
        this.setState({ amountKind });
    };

    createPeriodFilter = option => {
        let date = new Date();
        let year = date.getFullYear();

        // Careful: January is month 0.
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
    };

    handleShowAll = () => {
        this.refBarchart.current.show();
        this.refPiecharts.current.show();
    };

    handleHideAll = () => {
        this.refBarchart.current.hide();
        this.refPiecharts.current.hide();
    };

    render() {
        let allOps = this.props.operations;
        let filterByDate = this.createPeriodFilter(this.state.period);
        let pieOps = allOps.filter(op => filterByDate(op.budgetDate));

        // Filter by kind.
        let onlyPositive = this.state.amountKind === 'positive';
        let onlyNegative = this.state.amountKind === 'negative';

        if (onlyNegative) {
            pieOps = pieOps.filter(op => op.amount < 0);
        } else if (onlyPositive) {
            pieOps = pieOps.filter(op => op.amount > 0);
        }

        let pies = null;
        if (onlyPositive || onlyNegative) {
            pies = (
                <PieChart
                    chartId="piechart"
                    getCategoryById={this.props.getCategoryById}
                    operations={pieOps}
                    ref={this.refPiecharts}
                />
            );
        } else {
            // Compute raw income/spending.
            let rawIncomeOps = pieOps.filter(op => op.amount > 0);
            let rawSpendingOps = pieOps.filter(op => op.amount < 0);

            // Compute net income/spending.
            let catMap = new Map(); // categoryId -> [transactions].
            for (let op of pieOps) {
                if (!catMap.has(op.categoryId)) {
                    catMap.set(op.categoryId, []);
                }
                catMap.get(op.categoryId).push(op);
            }

            let netIncomeOps = [];
            let netSpendingOps = [];
            for (let categoryOperations of catMap.values()) {
                if (categoryOperations.reduce((acc, op) => acc + op.amount, 0) > 0) {
                    netIncomeOps = netIncomeOps.concat(categoryOperations);
                } else {
                    netSpendingOps = netSpendingOps.concat(categoryOperations);
                }
            }

            pies = (
                <AllPieCharts
                    getCategoryById={this.props.getCategoryById}
                    rawIncomeOps={rawIncomeOps}
                    netIncomeOps={netIncomeOps}
                    rawSpendingOps={rawSpendingOps}
                    netSpendingOps={netSpendingOps}
                    ref={this.refPiecharts}
                />
            );
        }

        return (
            <React.Fragment>
                <DiscoveryMessage message={$t('client.charts.by_category_desc')} />

                <form>
                    <p>
                        <label>{$t('client.charts.amount_type')}</label>
                        <AmountKindSelect
                            defaultValue={this.state.amountKind}
                            onChange={this.handleChangeAmountKind}
                        />
                    </p>

                    <p>
                        <label htmlFor="period">{$t('client.charts.period')}</label>
                        <PeriodSelect
                            defaultValue={this.props.defaultPeriod}
                            onChange={this.handleChangePeriod}
                            htmlId="period"
                        />
                    </p>

                    <div>
                        <label>{$t('client.menu.categories')}</label>

                        <p className="buttons-group" role="group" aria-label="Show/Hide categories">
                            <button type="button" className="btn" onClick={this.handleHideAll}>
                                {$t('client.general.unselect_all')}
                            </button>
                            <button type="button" className="btn" onClick={this.handleShowAll}>
                                {$t('client.general.select_all')}
                            </button>
                        </p>
                    </div>
                </form>

                <BarChart
                    operations={allOps}
                    getCategoryById={this.props.getCategoryById}
                    invertSign={onlyNegative}
                    chartId="barchart"
                    ref={this.refBarchart}
                    period={this.state.period}
                />

                {pies}
            </React.Fragment>
        );
    }
}

const Export = connect(state => {
    let defaultAmountKind = get.setting(state, 'default-chart-type');
    let defaultPeriod = get.setting(state, 'default-chart-period');
    return {
        defaultAmountKind,
        defaultPeriod,
        getCategoryById: id => get.categoryById(state, id)
    };
})(CategorySection);

export default Export;
